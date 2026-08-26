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

function severityLevelFromScore(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 35) return 'MEDIUM';
    return 'LOW';
}

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

function computeDynamicSeverity({
    urgency,
    duration,
    affected_population,
    vulnerability,
    essential_service,
    recurrence,
}, affectedComplaintCount = 0) {
    const factors = {
        urgency: Number(urgency || 0),
        duration: Number(duration || 0),
        affected_population: Number(affected_population || 0),
        vulnerability: Number(vulnerability || 0),
        essential_service: Number(essential_service || 0),
        recurrence: Number(recurrence || 0),
    };

    const score = Math.min(
        100,
        (
            0.25 * factors.urgency +
            0.20 * factors.affected_population +
            0.15 * factors.vulnerability +
            0.15 * factors.essential_service +
            0.15 * factors.duration +
            0.10 * factors.recurrence +
            Math.max(0, affectedComplaintCount - 1) * 6
        )
    );

    const final_score = Math.round(score * 100) / 100;
    return {
        score: final_score,
        level: severityLevelFromScore(final_score),
        factors,
        explanation: {
            urgency: factors.urgency >= 70 ? 'High urgency / immediate public risk' : 'Low urgency signal',
            duration: factors.duration >= 70 ? 'Issue reported as prolonged or recurring' : 'Short-duration issue',
            affected_population: factors.affected_population >= 70 ? 'Large or widespread impact' : 'Localized impact',
            vulnerability: factors.vulnerability >= 70 ? 'Vulnerable population or critical service involvement' : 'No obvious vulnerable-group signal',
            essential_service: factors.essential_service >= 70 ? 'Service is essential and disruption is high-impact' : 'Lower criticality of the service',
            recurrence: factors.recurrence >= 70 ? 'Issue recurs or several reports already exist' : 'No recurrence signal',
            cluster_effect: affectedComplaintCount > 1 ? `Affects ${affectedComplaintCount} linked complaints` : 'Single complaint in cluster',
        },
    };
}

function priorityFromScore(score) {
    return severityLevelFromScore(score);
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

        await pool.query(`
            ALTER TABLE severity_scores
              ADD COLUMN IF NOT EXISTS level VARCHAR(20) CHECK (level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
              ADD COLUMN IF NOT EXISTS priority_label VARCHAR(20) CHECK (priority_label IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
              ADD COLUMN IF NOT EXISTS factors JSONB,
              ADD COLUMN IF NOT EXISTS explanation_json JSONB,
              ADD COLUMN IF NOT EXISTS xai_explanation TEXT,
              ADD COLUMN IF NOT EXISTS requires_review BOOLEAN NOT NULL DEFAULT FALSE,
              ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                  CHECK (review_status IN ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED', 'FLAGGED'));
        `);

        const validationError = validateScoreFields(req.body);
        if (validationError) return res.status(400).json({ error: validationError });
        const final_score = computeSeverity(req.body);
        const priority_label = priorityFromScore(final_score);

        const factors = {
            urgency: Number(req.body.urgency || req.body.urgency_score || 0),
            duration: Number(req.body.duration || duration_score || 0),
            affected_population: Number(req.body.affected_population || affected_count_score || 0),
            vulnerability: Number(req.body.vulnerability || vulnerability_score || 0),
            essential_service: Number(req.body.essential_service || critical_infra_score || 0),
            recurrence: Number(req.body.recurrence || recurrence_score || 0),
        };

        const dynamic = computeDynamicSeverity(factors);
        const level = typeof req.body.level === 'string' ? req.body.level.toUpperCase() : dynamic.level;
        const xaiExplanation = typeof req.body.xai_explanation === 'string' ? req.body.xai_explanation : JSON.stringify(dynamic.explanation);

        const requiresReview = ['HIGH', 'CRITICAL'].includes(level) || Boolean(req.body.requires_review);
        const result = await pool.query(
            `INSERT INTO severity_scores
               (complaint_id, urgency_score, affected_count_score, vulnerability_score,
                critical_infra_score, duration_score, recurrence_score, final_score,
                level, priority_label, factors, explanation_json, xai_explanation, requires_review, review_status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
            [id, urgency_score || 0, affected_count_score || 0, vulnerability_score || 0,
             critical_infra_score || 0, duration_score || 0, recurrence_score || 0,
             final_score, level, priority_label, JSON.stringify(factors), explanation_json ? JSON.stringify(explanation_json) : JSON.stringify(dynamic.explanation), xaiExplanation, requiresReview, requiresReview ? 'PENDING' : 'APPROVED']
        );

        const clusterRow = await pool.query(`SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1`, [id]);
        if (clusterRow.rows.length) {
            await refreshMasterIssueCluster(clusterRow.rows[0].cluster_id);
        }

        await logAudit(id, null, 'AI_SEVERITY_SCORED', { final_score, level, priority_label, factors });

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
        const { routed_department_id, routed_officer_id, reason, ward, subdivision, confidence } = req.body;
        const normalizedConfidence = confidence === undefined || confidence === null ? null : Number(confidence);
        if (normalizedConfidence !== null && (!Number.isFinite(normalizedConfidence) || normalizedConfidence < 0 || normalizedConfidence > 1)) {
            return res.status(400).json({ error: 'confidence must be between 0 and 1' });
        }
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

        await client.query(`
            ALTER TABLE routing_results
             ADD COLUMN IF NOT EXISTS ward VARCHAR(100),
             ADD COLUMN IF NOT EXISTS subdivision VARCHAR(100),
             ADD COLUMN IF NOT EXISTS confidence NUMERIC(4,3) CHECK (confidence >= 0 AND confidence <= 1),
             ADD COLUMN IF NOT EXISTS reason TEXT,
             ADD COLUMN IF NOT EXISTS requires_review BOOLEAN NOT NULL DEFAULT FALSE,
             ADD COLUMN IF NOT EXISTS review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                  CHECK (review_status IN ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED', 'FLAGGED')),
             ADD COLUMN IF NOT EXISTS final_decision TEXT,
             ADD COLUMN IF NOT EXISTS recommended_officer_name VARCHAR(150);
        `);

        const requiresReview = Boolean((routed_department_id && routed_officer_id) || (normalizedConfidence !== null && normalizedConfidence >= 0.8) || (reason && /sensitive|critical|high|urgent|ward/i.test(reason)));
        const result = await client.query(
            `INSERT INTO routing_results (complaint_id, routed_department_id, routed_officer_id, ward, subdivision, confidence, reason, requires_review, review_status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [id, routed_department_id || null, routed_officer_id || null, ward || null, subdivision || null, normalizedConfidence, reason || null, requiresReview, requiresReview ? 'PENDING' : 'APPROVED']
        );
        await client.query(
            `UPDATE complaints SET department_id = COALESCE($1, department_id), assigned_officer_id = COALESCE($2, assigned_officer_id), updated_at = NOW() WHERE id = $3`,
            [routed_department_id || null, routed_officer_id || null, id]
        );
        await client.query('COMMIT');
        await logAudit(id, null, 'AI_ROUTED', { routed_department_id, routed_officer_id, ward, subdivision, confidence: normalizedConfidence, reason });
        return res.status(201).json({ routing: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('addRoutingResult error:', err);
        return res.status(500).json({ error: 'Something went wrong while saving the routing result' });
    } finally { client.release(); }
}

async function getComplaintAiContext(complaintId) {
    const [predictionRow, severityRow, routingRow, clusterRow, duplicatedRow, masterIssueRow] = await Promise.all([
        pool.query('SELECT * FROM ai_predictions WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [complaintId]),
        pool.query('SELECT * FROM severity_scores WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [complaintId]),
        pool.query('SELECT * FROM routing_results WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [complaintId]),
        pool.query('SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1', [complaintId]),
        pool.query('SELECT * FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1', [complaintId]),
        pool.query('SELECT * FROM duplicate_clusters WHERE id = (SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1)', [complaintId]),
    ]);

    const clusterId = clusterRow.rows[0]?.cluster_id || null;
    let duplicateMembers = [];
    if (clusterId) {
        duplicateMembers = (await pool.query(
            `SELECT c.id, c.title, c.status, dcm.similarity_score
             FROM duplicate_cluster_members dcm
             JOIN complaints c ON c.id = dcm.complaint_id
             WHERE dcm.cluster_id = $1
             ORDER BY dcm.similarity_score DESC NULLS LAST`,
            [clusterId]
        )).rows;
    }

    return {
        classification: predictionRow.rows[0] || null,
        severity: severityRow.rows[0] || null,
        routing: routingRow.rows[0] || null,
        duplicate_cluster: clusterId ? { cluster_id: clusterId, members: duplicateMembers } : null,
        master_issue: masterIssueRow.rows[0] || null,
        original_ai_recommendation: {
            classification: predictionRow.rows[0] || null,
            severity: severityRow.rows[0] || null,
            routing: routingRow.rows[0] || null,
            duplicate_cluster: clusterId ? { cluster_id: clusterId, members: duplicateMembers } : null,
            master_issue: masterIssueRow.rows[0] || null,
        }
    };
}

// ---------- OFFICER REVIEW (human-in-the-loop) ----------

// POST /api/complaints/:id/review
async function addOfficerReview(req, res) {
    try {
        const { id } = req.params;
        const { action, notes, modification_reason, final_decision } = req.body;
        const validActions = ['APPROVE', 'MODIFY', 'REJECT', 'FLAG_FOR_REVIEW'];

        await pool.query(`
            ALTER TABLE officer_reviews
              ADD COLUMN IF NOT EXISTS action VARCHAR(30),
              ADD COLUMN IF NOT EXISTS original_ai_recommendation JSONB,
              ADD COLUMN IF NOT EXISTS final_decision JSONB,
              ADD COLUMN IF NOT EXISTS modification_reason TEXT,
              ADD COLUMN IF NOT EXISTS notes TEXT;
        `);
        await pool.query(`
            ALTER TABLE officer_reviews DROP CONSTRAINT IF EXISTS officer_reviews_action_check;
            ALTER TABLE officer_reviews ADD CONSTRAINT officer_reviews_action_check
              CHECK (action IN ('APPROVE', 'MODIFY', 'REJECT', 'FLAG_FOR_REVIEW'));
        `);

        if (!validActions.includes(action)) {
            return res.status(400).json({ error: `action must be one of: ${validActions.join(', ')}` });
        }

        const officerRow = await pool.query('SELECT id FROM officers WHERE user_id = $1', [req.user.id]);
        if (officerRow.rows.length === 0) {
            return res.status(403).json({ error: 'Only officers can submit a review' });
        }
        const officer_id = officerRow.rows[0].id;

        const aiContext = await getComplaintAiContext(id);
        const originalAiRecommendation = aiContext.original_ai_recommendation;

        const decision = {
            decision: action,
            decision_by: officer_id,
            reason: modification_reason || notes || null,
            final_decision: final_decision || null,
            timestamp: new Date().toISOString(),
        };

        const result = await pool.query(
            `INSERT INTO officer_reviews
               (complaint_id, officer_id, action, original_ai_recommendation, final_decision, modification_reason, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id, officer_id, action, JSON.stringify(originalAiRecommendation), JSON.stringify(decision), modification_reason || notes || null, notes || null]
        );

        if (action === 'APPROVE') {
            await pool.query(`UPDATE severity_scores SET review_status = 'APPROVED' WHERE complaint_id = $1`, [id]);
            await pool.query(`UPDATE routing_results SET review_status = 'APPROVED', final_decision = $2 WHERE complaint_id = $1`, [id, 'APPROVED']);
        } else if (action === 'MODIFY') {
            await pool.query(`UPDATE severity_scores SET review_status = 'MODIFIED' WHERE complaint_id = $1`, [id]);
            await pool.query(`UPDATE routing_results SET review_status = 'MODIFIED', final_decision = $2 WHERE complaint_id = $1`, [id, 'MODIFIED']);
        } else if (action === 'REJECT') {
            await pool.query(`UPDATE severity_scores SET review_status = 'REJECTED' WHERE complaint_id = $1`, [id]);
            await pool.query(`UPDATE routing_results SET review_status = 'REJECTED', final_decision = $2 WHERE complaint_id = $1`, [id, 'REJECTED']);
        } else if (action === 'FLAG_FOR_REVIEW') {
            await pool.query(`UPDATE severity_scores SET review_status = 'FLAGGED' WHERE complaint_id = $1`, [id]);
            await pool.query(`UPDATE routing_results SET review_status = 'FLAGGED', final_decision = $2 WHERE complaint_id = $1`, [id, 'FLAGGED']);
        }

        await logAudit(id, req.user.id, `OFFICER_${action}`, { notes, decision, original_ai_recommendation: originalAiRecommendation });

        return res.status(201).json({ review: result.rows[0] });
    } catch (err) {
        console.error('addOfficerReview error:', err);
        return res.status(500).json({ error: 'Something went wrong while saving the review' });
    }
}

async function getPendingReviews(req, res) {
    try {
        const result = await pool.query(
            `SELECT c.id, c.title, c.status, ss.level AS severity_level, ss.priority_label, rr.routed_department_id, rr.review_status,
                   rr.reason AS routing_reason,
                   rr.created_at AS routing_created_at,
                   COALESCE(aur.action, 'PENDING') AS latest_review_action
             FROM complaints c
             LEFT JOIN LATERAL (
                SELECT level, priority_label
                FROM severity_scores
                WHERE complaint_id = c.id
                ORDER BY created_at DESC
                LIMIT 1
             ) ss ON true
             LEFT JOIN LATERAL (
                SELECT routed_department_id, reason, review_status, created_at
                FROM routing_results
                WHERE complaint_id = c.id
                ORDER BY created_at DESC
                LIMIT 1
             ) rr ON true
             LEFT JOIN LATERAL (
                SELECT action
                FROM officer_reviews
                WHERE complaint_id = c.id
                ORDER BY created_at DESC
                LIMIT 1
             ) aur ON true
             WHERE c.status NOT IN ('closed', 'resolved')
              AND (
                   COALESCE(ss.level, 'LOW') IN ('HIGH', 'CRITICAL')
                   OR COALESCE(rr.review_status, 'PENDING') = 'PENDING'
                   OR COALESCE(aur.action, 'PENDING') = 'FLAG_FOR_REVIEW'
              )
             ORDER BY c.created_at DESC`);
        return res.json({ pending_reviews: result.rows });
    } catch (err) {
        console.error('getPendingReviews error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching pending reviews' });
    }
}

async function getReviewHistory(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT orr.*, u.name AS officer_name
             FROM officer_reviews orr
             LEFT JOIN officers o ON o.id = orr.officer_id
             LEFT JOIN users u ON u.id = o.user_id
             WHERE orr.complaint_id = $1
             ORDER BY orr.created_at DESC`,
            [id]
        );
        return res.json({ reviews: result.rows });
    } catch (err) {
        console.error('getReviewHistory error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching review history' });
    }
}

async function getXaiExplanation(req, res) {
    try {
        const { id } = req.params;
        const aiContext = await getComplaintAiContext(id);
        return res.json({
            complaint_id: id,
            explanation: {
               classification: aiContext.classification ? {
                   predicted_category: aiContext.classification.predicted_category,
                   predicted_department: aiContext.classification.predicted_department,
                   confidence: aiContext.classification.confidence,
                   ai_summary: aiContext.classification.ai_summary,
               } : null,
               severity: aiContext.severity ? {
                   final_score: aiContext.severity.final_score,
                   level: aiContext.severity.level,
                   priority_label: aiContext.severity.priority_label,
                   factors: aiContext.severity.factors,
                   xai_explanation: aiContext.severity.xai_explanation,
                   explanation_json: aiContext.severity.explanation_json,
               } : null,
               routing: aiContext.routing ? {
                   routed_department_id: aiContext.routing.routed_department_id,
                   routed_officer_id: aiContext.routing.routed_officer_id,
                   ward: aiContext.routing.ward,
                   subdivision: aiContext.routing.subdivision,
                   confidence: aiContext.routing.confidence,
                   reason: aiContext.routing.reason,
                   requires_review: aiContext.routing.requires_review,
                   review_status: aiContext.routing.review_status,
               } : null,
               duplicate: aiContext.duplicate_cluster,
               master_issue: aiContext.master_issue,
            }
        });
    } catch (err) {
        console.error('getXaiExplanation error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching XAI explanation' });
    }
}

// ---------- SLA ----------

// POST /api/complaints/:id/sla
async function setSla(req, res) {
    try {
        const { id } = req.params;
        const { deadline, priority_label, status, started_at, resolved_at, is_breached, current_escalation_level, escalation_reason } = req.body;

        const complaintCheck = await pool.query('SELECT id FROM complaints WHERE id = $1', [id]);
        if (!complaintCheck.rows.length) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const { ensureSlaTrackingForComplaint } = require('../services/slaEscalation');
        const result = await ensureSlaTrackingForComplaint(id, priority_label || 'LOW', {
            deadline,
            status: status || 'ACTIVE',
            started_at: started_at || new Date().toISOString(),
            resolved_at: resolved_at || null,
            is_breached: typeof is_breached === 'boolean' ? is_breached : false,
            current_escalation_level: current_escalation_level || null,
            escalation_reason: escalation_reason || null,
        });

        await logAudit(id, null, 'SLA_SET', {
            deadline: result.deadline,
            status: result.status,
            priority_label: result.priority_label,
            current_escalation_level: result.current_escalation_level,
            escalation_reason: result.escalation_reason,
        });

        return res.status(201).json({ sla: result });
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

        const masterIssue = await refreshMasterIssueCluster(cluster_id);
        await logAudit(id, null, 'MARKED_DUPLICATE', { matched_complaint_id, similarity_score, cluster_id, master_issue: masterIssue });

        return res.status(201).json({ cluster_id, master_issue: masterIssue, member: member.rows[0] });
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

function deriveIssuePriority(affectedCount, severity) {
    const normalizedSeverity = severity || 'LOW';
    if (affectedCount >= 5 || normalizedSeverity === 'CRITICAL') return 'CRITICAL';
    if (affectedCount >= 3 || normalizedSeverity === 'HIGH') return 'HIGH';
    if (affectedCount >= 2 || normalizedSeverity === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
}

function inferCategoryFromText(text) {
    const haystack = String(text || '').toLowerCase();
    if (/water|pani|tap|pipeline|supply/.test(haystack)) return 'No water supply';
    if (/pothole|road|asphalt|crack/.test(haystack)) return 'Pothole';
    if (/streetlight|light|lamp|dark street/.test(haystack)) return 'Streetlight not working';
    if (/garbage|trash|waste|dump|sanitation/.test(haystack)) return 'Garbage not collected';
    return 'General Civic Issue';
}

async function refreshMasterIssueCluster(clusterId) {
    const memberResult = await pool.query(
        `SELECT c.id, c.title, c.description, c.status, c.latitude, c.longitude, c.category_id,
               COALESCE(cat.name, ap.predicted_category, 'General Civic Issue') AS category_name,
               ss.priority_label AS severity,
               ss.final_score,
               dcm.similarity_score
         FROM duplicate_cluster_members dcm
         JOIN complaints c ON c.id = dcm.complaint_id
         LEFT JOIN categories cat ON cat.id = c.category_id
         LEFT JOIN LATERAL (
             SELECT predicted_category
             FROM ai_predictions
             WHERE complaint_id = c.id
             ORDER BY created_at DESC
             LIMIT 1
         ) ap ON true
         LEFT JOIN LATERAL (
             SELECT priority_label, final_score
             FROM severity_scores
             WHERE complaint_id = c.id
             ORDER BY created_at DESC
             LIMIT 1
         ) ss ON true
         WHERE dcm.cluster_id = $1`,
        [clusterId]
    );

    if (!memberResult.rows.length) return null;

    const affectedCount = memberResult.rows.length;
    const categoryCounts = {};
    for (const row of memberResult.rows) {
        const key = row.category_name && row.category_name !== 'General Civic Issue'
            ? row.category_name
            : inferCategoryFromText(`${row.title || ''} ${row.description || ''}`);
        categoryCounts[key] = (categoryCounts[key] || 0) + 1;
    }
    const category = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General Civic Issue';

    const memberScores = memberResult.rows
        .map((row) => Number(row.final_score || 0))
        .filter((value) => Number.isFinite(value));
    const baseSeverityScore = memberScores.length
        ? memberScores.reduce((sum, value) => sum + value, 0) / memberScores.length
        : 0;
    const clusterSeverityScore = Math.min(100, baseSeverityScore + Math.max(0, affectedCount - 1) * 8);
    const severity = severityLevelFromScore(clusterSeverityScore);

    const locations = memberResult.rows
        .filter((row) => row.latitude != null && row.longitude != null)
        .map((row) => ({ latitude: Number(row.latitude), longitude: Number(row.longitude) }));
    let location = 'Multiple locations';
    if (locations.length) {
        const uniqueLocations = new Set(locations.map((loc) => `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`));
        if (uniqueLocations.size === 1) {
            const [latitude, longitude] = [...uniqueLocations][0].split(',');
            location = `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`;
        }
    }

    const openStates = ['submitted', 'in_progress', 'reopened'];
    const status = memberResult.rows.some((row) => openStates.includes(row.status)) ? 'open' : 'resolved';
    const priority = deriveIssuePriority(affectedCount, severity);

    const result = await pool.query(
        `UPDATE duplicate_clusters
         SET category = $1,
             location = $2,
             severity = $3,
             status = $4,
             affected_count = $5,
             priority = $6,
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [category, location, severity, status, affectedCount, priority, clusterId]
    );

    return result.rows[0];
}

async function getMasterIssueForComplaint(req, res) {
    try {
        const { id } = req.params;
        const clusterRow = await pool.query(
            `SELECT dc.*
             FROM duplicate_cluster_members dcm
             JOIN duplicate_clusters dc ON dc.id = dcm.cluster_id
             WHERE dcm.complaint_id = $1
             LIMIT 1`,
            [id]
        );

        if (!clusterRow.rows.length) {
            return res.json({ master_issue: null, complaints: [] });
        }

        const clusterId = clusterRow.rows[0].id;
        const complaints = await pool.query(
            `SELECT c.id, c.title, c.status, c.category_id, cat.name AS category_name,
                   c.latitude, c.longitude, ss.priority_label AS severity,
                   dcm.similarity_score
             FROM duplicate_cluster_members dcm
             JOIN complaints c ON c.id = dcm.complaint_id
             LEFT JOIN categories cat ON cat.id = c.category_id
             LEFT JOIN LATERAL (
                SELECT priority_label
                FROM severity_scores
                WHERE complaint_id = c.id
                ORDER BY created_at DESC
                LIMIT 1
             ) ss ON true
             WHERE dcm.cluster_id = $1
             ORDER BY dcm.similarity_score DESC NULLS LAST, c.created_at DESC`,
            [clusterId]
        );

        return res.json({ master_issue: clusterRow.rows[0], complaints: complaints.rows });
    } catch (err) {
        console.error('getMasterIssueForComplaint error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching the master issue' });
    }
}

async function listMasterIssues(req, res) {
    try {
        const result = await pool.query(
            `SELECT dc.*
             FROM duplicate_clusters dc
             ORDER BY dc.updated_at DESC` 
        );

        return res.json({ master_issues: result.rows });
    } catch (err) {
        console.error('listMasterIssues error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching master issues' });
    }
}

async function refreshMasterIssue(req, res) {
    try {
        const { id } = req.params;
        const clusterRow = await pool.query(
            `SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1`,
            [id]
        );

        if (!clusterRow.rows.length) {
            return res.status(404).json({ error: 'Complaint is not part of a master issue' });
        }

        const masterIssue = await refreshMasterIssueCluster(clusterRow.rows[0].cluster_id);
        return res.json({ master_issue: masterIssue });
    } catch (err) {
        console.error('refreshMasterIssue error:', err);
        return res.status(500).json({ error: 'Something went wrong while refreshing the master issue' });
    }
}

module.exports = {
    computeSeverity,
    computeDynamicSeverity,
    severityLevelFromScore,
    priorityFromScore,
    addPrediction,
    addSeverityScore,
    addAuthenticityResult,
    addRoutingResult,
    addOfficerReview,
    getPendingReviews,
    getReviewHistory,
    getXaiExplanation,
    setSla,
    getAuditTrail,
    getFullComplaintView,
    markDuplicate,
    getDuplicates,
    refreshMasterIssueCluster,
    getMasterIssueForComplaint,
    listMasterIssues,
    refreshMasterIssue,
};
