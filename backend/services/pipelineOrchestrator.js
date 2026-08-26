// services/pipelineOrchestrator.js
//
// Runs the full "AI service" step automatically, in-process, right after a
// citizen submits a complaint — instead of waiting for an external service
// to POST results into the pipeline endpoints. Populates ai_predictions,
// severity_scores, routing_results, sla_tracking, and duplicate_cluster_*
// using services/aiEngine.js, then writes the same audit-log entries the
// manual/external-AI endpoints in pipelineController would have written.
//
// Deliberately synchronous and best-effort: if any single step fails, it's
// logged and skipped rather than blowing up complaint creation, since a
// citizen's complaint should always be saved even if triage fails.

const pool = require('../db/pool');
const { logAudit } = require('../db/auditLog');
const { computeSeverity, priorityFromScore, refreshMasterIssueCluster } = require('../controllers/pipelineController');
const aiEngine = require('./aiEngine');
const { analyzeComplaintWithFallback } = require('./aiAdapter');

// Looks up the department a predicted category name belongs to (for
// complaints submitted without a category_id, so classification alone can
// still drive routing).
async function departmentForCategoryName(categoryName) {
    const { rows } = await pool.query(
        `SELECT department_id, (SELECT name FROM departments WHERE id = department_id) AS department_name
         FROM categories WHERE name = $1 LIMIT 1`,
        [categoryName]
    );
    return rows[0] || { department_id: null, department_name: null };
}

async function ensureRoutingResultColumns() {
    await pool.query(`
        ALTER TABLE routing_results
          ADD COLUMN IF NOT EXISTS ward VARCHAR(100),
          ADD COLUMN IF NOT EXISTS subdivision VARCHAR(100),
          ADD COLUMN IF NOT EXISTS confidence NUMERIC(4,3)
            CHECK (confidence >= 0 AND confidence <= 1),
          ADD COLUMN IF NOT EXISTS recommended_officer_name VARCHAR(150);
    `);
}

async function runAutoPipeline(complaint) {
    const complaintId = complaint.id;
    let aiAnalysis = null;

    // ---- 1. Classification ----
    let predicted_department_name = null;
    let department_id = complaint.department_id || null;
    let classification;
    try {
        aiAnalysis = await analyzeComplaintWithFallback(complaint);
        const classificationPayload = aiAnalysis?.classification || aiEngine.classifyComplaint(complaint.title, complaint.description);
        classification = {
            predicted_category: classificationPayload.category || classificationPayload.predicted_category || 'General Civic Issue',
            confidence: classificationPayload.confidence || 0,
            ai_summary: aiAnalysis?.summary || classificationPayload.ai_summary || complaint.description,
        };

        if (!department_id) {
            const resolved = await departmentForCategoryName(classification.predicted_category);
            department_id = resolved.department_id;
            predicted_department_name = resolved.department_name;
            if (department_id) {
                await pool.query(`UPDATE complaints SET department_id = $1, updated_at = NOW() WHERE id = $2`, [department_id, complaintId]);
            }
        } else {
            const { rows } = await pool.query('SELECT name FROM departments WHERE id = $1', [department_id]);
            predicted_department_name = rows[0]?.name || null;
        }

        await pool.query(
            `INSERT INTO ai_predictions (complaint_id, predicted_category, predicted_department, confidence, ai_summary, model_version)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [complaintId, classification.predicted_category, predicted_department_name, classification.confidence, classification.ai_summary, aiAnalysis?.service_mode || 'rule-based-v1']
        );
        await logAudit(complaintId, null, 'AI_CLASSIFIED', { predicted_category: classification.predicted_category, predicted_department: predicted_department_name, confidence: classification.confidence });
    } catch (err) {
        console.error('pipelineOrchestrator: classification step failed:', err);
    }

    // ---- 2. Duplicate detection (needs department_id resolved above) ----
    let recurrenceCount = 0;
    try {
        const dup = await aiEngine.findDuplicate({ id: complaintId, title: complaint.title, description: complaint.description, department_id });
        if (dup.matched_complaint_id) {
            recurrenceCount = dup.recurrenceCount;

            let clusterResult = await pool.query(`SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1`, [dup.matched_complaint_id]);
            let cluster_id;
            if (clusterResult.rows.length > 0) {
                cluster_id = clusterResult.rows[0].cluster_id;
            } else {
                const newCluster = await pool.query(`INSERT INTO duplicate_clusters (representative_complaint_id) VALUES ($1) RETURNING id`, [dup.matched_complaint_id]);
                cluster_id = newCluster.rows[0].id;
                await pool.query(
                    `INSERT INTO duplicate_cluster_members (cluster_id, complaint_id, similarity_score) VALUES ($1,$2,1.0) ON CONFLICT DO NOTHING`,
                    [cluster_id, dup.matched_complaint_id]
                );
            }
            await pool.query(
                `INSERT INTO duplicate_cluster_members (cluster_id, complaint_id, similarity_score)
                 VALUES ($1,$2,$3) ON CONFLICT (cluster_id, complaint_id) DO UPDATE SET similarity_score = EXCLUDED.similarity_score`,
                [cluster_id, complaintId, dup.similarity_score]
            );
            await refreshMasterIssueCluster(cluster_id);
            await logAudit(complaintId, null, 'MARKED_DUPLICATE', { matched_complaint_id: dup.matched_complaint_id, similarity_score: dup.similarity_score, cluster_id });
        }
    } catch (err) {
        console.error('pipelineOrchestrator: duplicate-detection step failed:', err);
    }

    // ---- 3. Severity scoring (uses recurrenceCount from step 2) ----
    let priority_label = 'LOW';
    try {
        const inputs = aiEngine.scoreSeverityInputs(complaint.title, complaint.description, recurrenceCount);
        const final_score = computeSeverity(inputs);
        priority_label = priorityFromScore(final_score);

        await pool.query(
            `INSERT INTO severity_scores
                (complaint_id, urgency_score, affected_count_score, vulnerability_score,
                 critical_infra_score, duration_score, recurrence_score, final_score,
                 priority_label, explanation_json)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [complaintId, inputs.urgency_score, inputs.affected_count_score, inputs.vulnerability_score,
             inputs.critical_infra_score, inputs.duration_score, inputs.recurrence_score,
             final_score, priority_label, JSON.stringify(inputs.explanation_json)]
        );
        await logAudit(complaintId, null, 'AI_SEVERITY_SCORED', { final_score, priority_label });
    } catch (err) {
        console.error('pipelineOrchestrator: severity-scoring step failed:', err);
    }

    // ---- 4. Routing (AI recommendation validated by the backend before persistence) ----
    try {
        await ensureRoutingResultColumns();
        const aiRouting = aiAnalysis?.routing || {
            department_name: predicted_department_name || (complaint.department_id ? null : classification?.predicted_category || null),
            ward_or_subdivision: complaint.latitude || complaint.longitude ? 'Ward 12' : 'Unspecified',
            recommended_officer: null,
            confidence: 0.72,
            reason: 'AI routing recommendation requires backend validation before assignment.',
        };
        const validated = await aiEngine.validateRoutingRecommendation(aiRouting, {
            department_id,
            ward: complaint.latitude || complaint.longitude ? 'Ward 12' : 'Unspecified',
        });

        await pool.query(
            `INSERT INTO routing_results (complaint_id, routed_department_id, routed_officer_id, ward, subdivision, confidence, reason)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [complaintId, validated.department_id, validated.officer_id, validated.ward, validated.subdivision, validated.confidence, validated.reason]
        );
        if (validated.officer_id || validated.department_id) {
            await pool.query(
                `UPDATE complaints SET department_id = COALESCE($1, department_id), assigned_officer_id = COALESCE($2, assigned_officer_id), updated_at = NOW() WHERE id = $3`,
                [validated.department_id, validated.officer_id, complaintId]
            );
        }
        await logAudit(complaintId, null, 'AI_ROUTED', { department_id: validated.department_id, officer_id: validated.officer_id, ward: validated.ward, confidence: validated.confidence, reason: validated.reason });
    } catch (err) {
        console.error('pipelineOrchestrator: routing step failed:', err);
    }

    // ---- 5. SLA deadline from priority ----
    try {
        const deadline = aiEngine.calculateSlaDeadline(priority_label);
        await pool.query(
            `INSERT INTO sla_tracking (complaint_id, deadline) VALUES ($1,$2)
             ON CONFLICT (complaint_id) DO UPDATE SET deadline = EXCLUDED.deadline`,
            [complaintId, deadline]
        );
        await logAudit(complaintId, null, 'SLA_SET', { deadline, priority_label });
    } catch (err) {
        console.error('pipelineOrchestrator: SLA step failed:', err);
    }
}

module.exports = { runAutoPipeline };
