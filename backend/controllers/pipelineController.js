// controllers/pipelineController.js
// Endpoints for everything the AI service and officer actions write:
// predictions, severity, authenticity, routing, reviews, SLA, and audit trail.
// The AI service (Python/FastAPI) is expected to POST its results to these
// endpoints once it classifies/scores a complaint.

const pool = require('../db/pool');
const { logAudit } = require('../db/auditLog');

const SCORE_FIELDS = ['urgency_score','affected_count_score','vulnerability_score','critical_infra_score','duration_score','recurrence_score'];
function validateScoreFields(body) {
    for (const field of SCORE_FIELDS) {
        if (body[field] === undefined || body[field] === null) continue;
        const n = Number(body[field]);
        if (!Number.isFinite(n) || n < 0 || n > 100) return `${field} must be between 0 and 100`;
    }
    return null;
}

// ---------- AI PREDICTIONS ----------

// POST /api/complaints/:id/ai-prediction
async function addPrediction(req, res) {
    try {
        const { id } = req.params;
        const { predicted_category, predicted_department, confidence, ai_summary, model_version } = req.body;

        const complaintCheck = await pool.query('SELECT id FROM complaints WHERE id = $1', [id]);
        if (!complaintCheck.rows.length) return res.status(404).json({ error: 'Complaint not found' });
        if (confidence !== undefined && (Number(confidence) < 0 || Number(confidence) > 100 || !Number.isFinite(Number(confidence)))) {
            return res.status(400).json({ error: 'confidence must be between 0 and 100' });
        }

        const result = await pool.query(
            `INSERT INTO ai_predictions
                (complaint_id, predicted_category, predicted_department, confidence, ai_summary, model_version)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, predicted_category || null, predicted_department || null, confidence || null, ai_summary || null, model_version || null]
        );

        await logAudit(id, null, 'AI_CLASSIFIED', { predicted_category, predicted_department, confidence });

        return res.status(201).json({ prediction: result.rows[0] });
    } catch (err) {
        console.error('addPrediction error:', err);
        return res.status(500).json({ error: 'Something went wrong while saving the AI prediction' });
    }
}

// ---------- SEVERITY ----------

// Weights follow the documented formula:
// 0.25*urgency + 0.20*affected + 0.15*vulnerability + 0.15*infra + 0.15*duration + 0.10*recurrence
function computeSeverity({ urgency_score, affected_count_score, vulnerability_score, critical_infra_score, duration_score, recurrence_score }) {
    const weights = { urgency: 0.25, affected: 0.20, vulnerability: 0.15, infra: 0.15, duration: 0.15, recurrence: 0.10 };
    const final =
        weights.urgency * (urgency_score || 0) +
        weights.affected * (affected_count_score || 0) +
        weights.vulnerability * (vulnerability_score || 0) +
        weights.infra * (critical_infra_score || 0) +
        weights.duration * (duration_score || 0) +
        weights.recurrence * (recurrence_score || 0);
    return Math.round(final * 100) / 100;
}

function priorityFromScore(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 35) return 'MEDIUM';
    return 'LOW';
}

// POST /api/complaints/:id/severity
async function addSeverityScore(req, res) {
    try {
        const { id } = req.params;
        const {
            urgency_score, affected_count_score, vulnerability_score,
            critical_infra_score, duration_score, recurrence_score,
            explanation_json,
        } = req.body;

        const validationError = validateScoreFields(req.body);
        if (validationError) return res.status(400).json({ error: validationError });
        const final_score = computeSeverity(req.body);
        const priority_label = priorityFromScore(final_score);

        const result = await pool.query(
            `INSERT INTO severity_scores
                (complaint_id, urgency_score, affected_count_score, vulnerability_score,
                 critical_infra_score, duration_score, recurrence_score, final_score,
                 priority_label, explanation_json)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [id, urgency_score || 0, affected_count_score || 0, vulnerability_score || 0,
             critical_infra_score || 0, duration_score || 0, recurrence_score || 0,
             final_score, priority_label, explanation_json ? JSON.stringify(explanation_json) : null]
        );

        await logAudit(id, null, 'AI_SEVERITY_SCORED', { final_score, priority_label });

        return res.status(201).json({ severity: result.rows[0] });
    } catch (err) {
        console.error('addSeverityScore error:', err);
        return res.status(500).json({ error: 'Something went wrong while saving the severity score' });
    }
}

// ---------- AUTHENTICITY ----------

// POST /api/complaints/:id/authenticity
async function addAuthenticityResult(req, res) {
    try {
        const { id } = req.params;
        const {
            account_trust_score, content_validity_score, location_consistency_score,
            evidence_consistency_score, spam_probability,
        } = req.body;

        // simple weighted average — replace with the real model's output when ready
        const authenticity_score = Math.round(
            ((account_trust_score || 0) + (content_validity_score || 0) +
             (location_consistency_score || 0) + (evidence_consistency_score || 0)) / 4 * 100
        ) / 100;

        let result_label = 'SUSPICIOUS';
        if (authenticity_score >= 80) result_label = 'GENUINE';
        else if (authenticity_score >= 50) result_label = 'NEEDS_REVIEW';

        const authenticityValues = [account_trust_score, content_validity_score, location_consistency_score, evidence_consistency_score];
        if (authenticityValues.some(v => v !== undefined && (!Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > 100))) {
            return res.status(400).json({ error: 'authenticity component scores must be between 0 and 100' });
        }
        if (spam_probability !== undefined && (!Number.isFinite(Number(spam_probability)) || Number(spam_probability) < 0 || Number(spam_probability) > 1)) {
            return res.status(400).json({ error: 'spam_probability must be between 0 and 1' });
        }

        const result = await pool.query(
            `INSERT INTO authenticity_results
                (complaint_id, account_trust_score, content_validity_score, location_consistency_score,
                 evidence_consistency_score, spam_probability, authenticity_score, result_label)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [id, account_trust_score || 0, content_validity_score || 0, location_consistency_score || 0,
             evidence_consistency_score || 0, spam_probability || 0, authenticity_score, result_label]
        );

        await logAudit(id, null, 'AUTHENTICITY_CHECKED', { authenticity_score, result_label });

        return res.status(201).json({ authenticity: result.rows[0] });
    } catch (err) {
        console.error('addAuthenticityResult error:', err);
        return res.status(500).json({ error: 'Something went wrong while saving the authenticity result' });
    }
}

// ---------- ROUTING ----------

// POST /api/complaints/:id/routing
async function addRoutingResult(req, res) {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { routed_department_id, routed_officer_id, reason } = req.body;
        await client.query('BEGIN');

        const complaint = await client.query('SELECT id FROM complaints WHERE id = $1 FOR UPDATE', [id]);
        if (!complaint.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Complaint not found' }); }

        if (routed_department_id) {
            const dept = await client.query('SELECT id FROM departments WHERE id = $1', [routed_department_id]);
            if (!dept.rows.length) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Invalid routed_department_id' }); }
        }
        if (routed_officer_id) {
            const officer = await client.query('SELECT id, department_id FROM officers WHERE id = $1', [routed_officer_id]);
            if (!officer.rows.length) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Invalid routed_officer_id' }); }
            if (routed_department_id && officer.rows[0].department_id !== routed_department_id) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Routed officer does not belong to the routed department' });
            }
        }

        const result = await client.query(
            `INSERT INTO routing_results (complaint_id, routed_department_id, routed_officer_id, reason)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [id, routed_department_id || null, routed_officer_id || null, reason || null]
        );
        await client.query(
            `UPDATE complaints SET department_id = COALESCE($1, department_id), assigned_officer_id = COALESCE($2, assigned_officer_id), updated_at = NOW() WHERE id = $3`,
            [routed_department_id || null, routed_officer_id || null, id]
        );
        await client.query('COMMIT');
        await logAudit(id, null, 'AI_ROUTED', { routed_department_id, routed_officer_id, reason });
        return res.status(201).json({ routing: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('addRoutingResult error:', err);
        return res.status(500).json({ error: 'Something went wrong while saving the routing result' });
    } finally { client.release(); }
}

// ---------- OFFICER REVIEW (human-in-the-loop) ----------

// POST /api/complaints/:id/review
async function addOfficerReview(req, res) {
    try {
        const { id } = req.params;
        const { action, notes } = req.body;
        const validActions = ['APPROVE_AI', 'MODIFY_AI', 'FLAG_FOR_REVIEW'];

        if (!validActions.includes(action)) {
            return res.status(400).json({ error: `action must be one of: ${validActions.join(', ')}` });
        }

        // req.user.id is the logged-in user; look up their officer row
        const officerRow = await pool.query('SELECT id FROM officers WHERE user_id = $1', [req.user.id]);
        if (officerRow.rows.length === 0) {
            return res.status(403).json({ error: 'Only officers can submit a review' });
        }
        const officer_id = officerRow.rows[0].id;

        const result = await pool.query(
            `INSERT INTO officer_reviews (complaint_id, officer_id, action, notes)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [id, officer_id, action, notes || null]
        );

        await logAudit(id, req.user.id, `OFFICER_${action}`, { notes });

        return res.status(201).json({ review: result.rows[0] });
    } catch (err) {
        console.error('addOfficerReview error:', err);
        return res.status(500).json({ error: 'Something went wrong while saving the review' });
    }
}

// ---------- SLA ----------

// POST /api/complaints/:id/sla
async function setSla(req, res) {
    try {
        const { id } = req.params;
        const { deadline } = req.body; // ISO timestamp string

        if (!deadline) {
            return res.status(400).json({ error: 'deadline is required (ISO timestamp)' });
        }

        const result = await pool.query(
            `INSERT INTO sla_tracking (complaint_id, deadline)
             VALUES ($1, $2)
             ON CONFLICT (complaint_id) DO UPDATE SET deadline = EXCLUDED.deadline
             RETURNING *`,
            [id, deadline]
        );

        await logAudit(id, null, 'SLA_SET', { deadline });

        return res.status(201).json({ sla: result.rows[0] });
    } catch (err) {
        console.error('setSla error:', err);
        return res.status(500).json({ error: 'Something went wrong while setting the SLA deadline' });
    }
}

// ---------- AUDIT TRAIL ----------

// GET /api/complaints/:id/audit
async function getAuditTrail(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT al.*, u.name AS actor_name
             FROM audit_logs al
             LEFT JOIN users u ON u.id = al.actor_id
             WHERE al.complaint_id = $1
             ORDER BY al.created_at ASC`,
            [id]
        );
        return res.json({ audit_trail: result.rows });
    } catch (err) {
        console.error('getAuditTrail error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching the audit trail' });
    }
}

// ---------- COMBINED VIEW (for the officer dashboard "complaint details" screen) ----------

// GET /api/complaints/:id/full
async function getFullComplaintView(req, res) {
    try {
        const { id } = req.params;

        const complaint = await pool.query('SELECT * FROM complaints WHERE id = $1', [id]);
        if (complaint.rows.length === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const [media, prediction, severity, authenticity, routing, reviews, sla, duplicates] = await Promise.all([
            pool.query('SELECT * FROM complaint_media WHERE complaint_id = $1', [id]),
            pool.query('SELECT * FROM ai_predictions WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [id]),
            pool.query('SELECT * FROM severity_scores WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [id]),
            pool.query('SELECT * FROM authenticity_results WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [id]),
            pool.query('SELECT * FROM routing_results WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [id]),
            pool.query('SELECT * FROM officer_reviews WHERE complaint_id = $1 ORDER BY created_at DESC', [id]),
            pool.query('SELECT * FROM sla_tracking WHERE complaint_id = $1', [id]),
            pool.query(
                `SELECT dcm.* FROM duplicate_cluster_members dcm
                 WHERE dcm.cluster_id = (
                     SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1
                 )`,
                [id]
            ),
        ]);

        return res.json({
            complaint: complaint.rows[0],
            media: media.rows,
            ai_prediction: prediction.rows[0] || null,
            severity: severity.rows[0] || null,
            authenticity: authenticity.rows[0] || null,
            routing: routing.rows[0] || null,
            officer_reviews: reviews.rows,
            sla: sla.rows[0] || null,
            duplicate_cluster_members: duplicates.rows,
        });
    } catch (err) {
        console.error('getFullComplaintView error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching the full complaint view' });
    }
}

// ---------- DUPLICATE DETECTION ----------

// POST /api/complaints/:id/duplicate
// AI service calls this when it finds that this complaint matches an existing
// one closely enough to be considered a duplicate.
// Body: { matched_complaint_id, similarity_score }
// If matched_complaint_id already belongs to a cluster, this complaint joins it.
// Otherwise a new cluster is created with matched_complaint_id as the representative.
async function markDuplicate(req, res) {
    try {
        const { id } = req.params; // the new/incoming complaint
        const { matched_complaint_id, similarity_score } = req.body;

        if (!matched_complaint_id) return res.status(400).json({ error: 'matched_complaint_id is required' });
        if (matched_complaint_id === id) return res.status(400).json({ error: 'A complaint cannot be a duplicate of itself' });
        if (similarity_score !== undefined && (!Number.isFinite(Number(similarity_score)) || Number(similarity_score) < 0 || Number(similarity_score) > 1)) {
            return res.status(400).json({ error: 'similarity_score must be between 0 and 1' });
        }
        const exists = await pool.query('SELECT id FROM complaints WHERE id = ANY($1::uuid[])', [[id, matched_complaint_id]]);
        if (exists.rows.length !== 2) return res.status(404).json({ error: 'Complaint or matched complaint not found' });

        // Does the matched complaint already belong to a cluster?
        let clusterResult = await pool.query(
            `SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1`,
            [matched_complaint_id]
        );

        let cluster_id;
        if (clusterResult.rows.length > 0) {
            cluster_id = clusterResult.rows[0].cluster_id;
        } else {
            const newCluster = await pool.query(
                `INSERT INTO duplicate_clusters (representative_complaint_id) VALUES ($1) RETURNING id`,
                [matched_complaint_id]
            );
            cluster_id = newCluster.rows[0].id;

            // Add the original matched complaint as the first member too
            await pool.query(
                `INSERT INTO duplicate_cluster_members (cluster_id, complaint_id, similarity_score)
                 VALUES ($1, $2, 1.0) ON CONFLICT DO NOTHING`,
                [cluster_id, matched_complaint_id]
            );
        }

        const member = await pool.query(
            `INSERT INTO duplicate_cluster_members (cluster_id, complaint_id, similarity_score)
             VALUES ($1, $2, $3)
             ON CONFLICT (cluster_id, complaint_id) DO UPDATE SET similarity_score = EXCLUDED.similarity_score
             RETURNING *`,
            [cluster_id, id, similarity_score || null]
        );

        await logAudit(id, null, 'MARKED_DUPLICATE', { matched_complaint_id, similarity_score, cluster_id });

        return res.status(201).json({ cluster_id, member: member.rows[0] });
    } catch (err) {
        console.error('markDuplicate error:', err);
        return res.status(500).json({ error: 'Something went wrong while marking the duplicate' });
    }
}

// GET /api/complaints/:id/duplicates
// Returns every other complaint in the same cluster as this one (if any).
async function getDuplicates(req, res) {
    try {
        const { id } = req.params;

        const clusterRow = await pool.query(
            `SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1`,
            [id]
        );

        if (clusterRow.rows.length === 0) {
            return res.json({ cluster_id: null, duplicates: [] });
        }

        const cluster_id = clusterRow.rows[0].cluster_id;

        const duplicates = await pool.query(
            `SELECT c.id, c.title, c.status, c.created_at, dcm.similarity_score
             FROM duplicate_cluster_members dcm
             JOIN complaints c ON c.id = dcm.complaint_id
             WHERE dcm.cluster_id = $1 AND dcm.complaint_id != $2
             ORDER BY dcm.similarity_score DESC NULLS LAST`,
            [cluster_id, id]
        );

        return res.json({ cluster_id, duplicates: duplicates.rows });
    } catch (err) {
        console.error('getDuplicates error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching duplicates' });
    }
}

module.exports = {
    addPrediction,
    addSeverityScore,
    addAuthenticityResult,
    addRoutingResult,
    addOfficerReview,
    setSla,
    getAuditTrail,
    getFullComplaintView,
    markDuplicate,
    getDuplicates,
};
