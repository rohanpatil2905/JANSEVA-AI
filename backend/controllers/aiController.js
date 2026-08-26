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

module.exports = { analyzeComplaint, getAiHealth, getAiJobStatus };
