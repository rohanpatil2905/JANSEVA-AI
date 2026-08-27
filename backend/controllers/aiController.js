const pool = require('../db/pool');
const { analyzeComplaintWithFallback } = require('../services/aiAdapter');

async function analyzeComplaint(req, res) {
    try {
        const payload = {
            title: req.body?.title || '',
            description: req.body?.description || '',
            language: req.body?.language || 'en',
            category_id: req.body?.category_id || null,
            department_id: req.body?.department_id || null,
            latitude: req.body?.latitude ?? null,
            longitude: req.body?.longitude ?? null,
            media: req.body?.media || [],
            existing_complaints: req.body?.existing_complaints || [],
        };

        if (!payload.title || !payload.description) {
            return res.status(400).json({ error: 'title and description are required' });
        }

        const result = await analyzeComplaintWithFallback(payload, payload.existing_complaints);
        return res.json({
            status: 'ok',
            analysis: result,
            requires_human_verification: true,
        });
    } catch (err) {
        console.error('AI analyze error:', err);
        return res.status(500).json({ error: 'Something went wrong while analyzing the complaint' });
    }
}

async function getAiHealth(req, res) {
    try {
        const { isAiServiceConfigured } = require('../services/aiAdapter');
        return res.json({
            status: 'ok',
            ai_service_configured: isAiServiceConfigured(),
            fallback_mode: true,
            model: 'janseva-ai-fallback-and-adapter',
        });
    } catch (err) {
        console.error('AI health error:', err);
        return res.status(500).json({ error: 'Unable to determine AI service health' });
    }
}

async function getAiJobStatus(req, res) {
    try {
        const { complaintId } = req.params;
        const { rows } = await pool.query(
            `SELECT complaint_id, job_type, status, provider, model, source, result, error_message, updated_at
             FROM ai_processing_jobs
             WHERE complaint_id = $1
             ORDER BY updated_at DESC`,
            [complaintId]
        );
        return res.json({ jobs: rows });
    } catch (err) {
        console.error('getAiJobStatus error:', err);
        return res.status(500).json({ error: 'Unable to load AI job status' });
    }
}

async function getAiRecommendations(req, res) {
    try {
        const { complaintId } = req.params;

        const complaintResult = await pool.query(
            `SELECT *
             FROM complaints
             WHERE id = $1`,
            [complaintId]
        );

        if (!complaintResult.rows.length) {
            return res.status(404).json({
                error: 'Complaint not found'
            });
        }

        const complaint = complaintResult.rows[0];

        const predictionResult = await pool.query(
            `SELECT predicted_category,
                    predicted_department,
                    confidence
             FROM ai_predictions
             WHERE complaint_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [complaintId]
        );

        const severityResult = await pool.query(
            `SELECT final_score,
                    priority_label
             FROM severity_scores
             WHERE complaint_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [complaintId]
        );

        const routingResult = await pool.query(
            `SELECT routed_department_id,
                    routed_officer_id,
                    ward,
                    subdivision,
                    confidence,
                    reason
             FROM routing_results
             WHERE complaint_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [complaintId]
        );

        const prediction = predictionResult.rows[0] || null;
        const severity = severityResult.rows[0] || null;
        const routing = routingResult.rows[0] || null;

        return res.json({
            complaintId: complaint.id,

            predictedCategory:
                prediction?.predicted_category ||
                complaint.category_id ||
                null,

            recommendedDepartment:
                prediction?.predicted_department ||
                null,

            severityScore:
                severity?.final_score ??
                null,

            priority:
                severity?.priority_label ||
                null,

            confidence:
                prediction?.confidence ??
                routing?.confidence ??
                null,

            routing: routing || null,

            aiSummary:
                complaint.translated_text ||
                complaint.description ||
                '',

            xaiFactors: [],

            source: prediction || severity || routing
                ? 'database'
                : 'fallback',

            requiresHumanVerification: true
        });

    } catch (err) {
        console.error('getAiRecommendations error:', err);

        return res.status(500).json({
            error: 'Unable to load AI recommendations'
        });
    }
}

module.exports = {
    analyzeComplaint,
    getAiHealth,
    getAiJobStatus,
    getAiRecommendations
};
