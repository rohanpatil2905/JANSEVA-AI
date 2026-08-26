// controllers/complaintController.js
const pool = require('../db/pool');
const { logAudit } = require('../db/auditLog');
const { refreshMasterIssueCluster } = require('./pipelineController');
const fs = require('fs');
const { ALLOWED_MIME_TYPES } = require('../middleware/upload');
const { runAutoPipeline } = require('../services/pipelineOrchestrator');
const { detectLanguage, transcribeAudio, translateText, translateOfficerResponse: translateOfficerNote } = require('../services/multilingualProvider');

const VALID_STATUSES = ['submitted', 'in_progress', 'resolved', 'reopened', 'closed'];
const STATUS_TRANSITIONS = {
    submitted: ['in_progress'],
    in_progress: ['resolved'],
    resolved: ['closed', 'reopened'],
    reopened: ['in_progress'],
    closed: [],
};

function validCoordinate(value, min, max) {
    if (value === undefined || value === null || value === '') return true;
    const n = Number(value);
    return Number.isFinite(n) && n >= min && n <= max;
}

async function createComplaint(req, res) {
    try {
        const citizen_id = req.user.id;
        const {
            title,
            description,
            category_id,
            latitude,
            longitude,
            language,
            original_language,
            original_text,
            transcript_text,
            translated_text,
            audio_reference,
            citizen_language,
        } = req.body;

        const normalizedTitle = title || (translated_text ? String(translated_text).slice(0, 120) : 'Complaint');
        const normalizedDescription = description || translated_text || original_text || 'Complaint submitted';

        if (!normalizedTitle || !normalizedDescription) return res.status(400).json({ error: 'title and description are required' });
        if (String(normalizedTitle).length > 200) return res.status(400).json({ error: 'title must be 200 characters or fewer' });
        if (!validCoordinate(latitude, -90, 90) || !validCoordinate(longitude, -180, 180)) {
            return res.status(400).json({ error: 'Invalid latitude or longitude' });
        }

        let department_id = null;
        if (category_id) {
            const cat = await pool.query('SELECT department_id FROM categories WHERE id = $1', [category_id]);
            if (!cat.rows.length) return res.status(400).json({ error: 'Invalid category_id' });
            department_id = cat.rows[0].department_id;
        }

        const tracking_code = `JAN-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const sourceLanguage = original_language || language || citizen_language || detectLanguage(String(original_text || normalizedDescription));
        const complaintLanguage = language || (translated_text ? 'en' : sourceLanguage);
        const result = await pool.query(
            `INSERT INTO complaints
               (citizen_id, category_id, department_id, title, description, latitude, longitude, tracking_code,
                language, original_language, original_text, transcript_text, translated_text, audio_reference, citizen_language)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
            [citizen_id, category_id || null, department_id, normalizedTitle, normalizedDescription,
             latitude === '' ? null : latitude, longitude === '' ? null : longitude, tracking_code,
             complaintLanguage, sourceLanguage, original_text || normalizedDescription, transcript_text || original_text || normalizedDescription,
             translated_text || normalizedDescription, audio_reference || null, citizen_language || sourceLanguage]
        );

        const complaint = result.rows[0];
        await logAudit(complaint.id, citizen_id, 'SUBMITTED', { title: normalizedTitle, category_id: category_id || null, language: complaintLanguage, original_language: sourceLanguage });
        await pool.query(
            `INSERT INTO ai_processing_jobs (complaint_id, job_type, status, source, provider, model, payload)
             VALUES ($1, $2, 'PENDING', 'backend', 'node-express', 'janseva-core', $3)
             ON CONFLICT (complaint_id, job_type) DO NOTHING`,
            [complaint.id, 'complaint_triage', JSON.stringify({ title, description })]
        );

        // Run classification/severity/duplicate/routing/SLA immediately so the
        // complaint comes back already triaged — no external AI service to
        // wait on. Best-effort: a triage failure never blocks the citizen's
        // submission from succeeding (see services/pipelineOrchestrator for per-step
        // error handling).
        let triage = null;
        try {
            await runAutoPipeline(complaint);
            await pool.query(
                `UPDATE ai_processing_jobs
                 SET status = 'COMPLETED',
                     source = 'fallback',
                     provider = 'node-rule-engine',
                     model = 'rule-based-v1',
                     result = $2,
                     updated_at = NOW()
                 WHERE complaint_id = $1 AND job_type = 'complaint_triage'`,
                [complaint.id, JSON.stringify({ status: 'completed', source: 'fallback', model: 'rule-based-v1' })]
            );
            const { rows } = await pool.query(
                `SELECT
                    (SELECT row_to_json(p) FROM (SELECT predicted_category, predicted_department, confidence FROM ai_predictions WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1) p) AS ai_prediction,
                    (SELECT row_to_json(s) FROM (SELECT final_score, priority_label FROM severity_scores WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1) s) AS severity,
                    (SELECT row_to_json(r) FROM (SELECT routed_department_id, routed_officer_id, ward, subdivision, confidence, reason FROM routing_results WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1) r) AS routing,
                    (SELECT row_to_json(sla) FROM (SELECT deadline FROM sla_tracking WHERE complaint_id = $1) sla) AS sla`,
                [complaint.id]
            );
            triage = rows[0];
        } catch (err) {
            await pool.query(
                `UPDATE ai_processing_jobs
                 SET status = 'FAILED', error_message = $2, updated_at = NOW()
                 WHERE complaint_id = $1 AND job_type = 'complaint_triage'`,
                [complaint.id, err.message || 'Unknown AI triage failure']
            );
            console.error('createComplaint: auto-triage failed (complaint still saved):', err);
        }

        return res.status(201).json({
            complaint,
            triage,
            provider_status: req.body.provider_status || 'FALLBACK',
            provider: req.body.provider || 'local-fallback',
            original_language: req.body.original_language || req.body.language || detectLanguage(String(req.body.original_text || req.body.description || '')),
            language: req.body.language || 'en',
            translated_text: req.body.translated_text || req.body.description || null,
        });
    } catch (err) {
        console.error('createComplaint error:', err);
        return res.status(500).json({ error: 'Something went wrong while creating the complaint' });
    }
}

async function submitVoiceComplaint(req, res) {
    try {
        const { audio_url, transcript, description, title, target_language = 'en', language } = req.body;
        const speechResult = await transcribeAudio({ audio_url, transcript, description, text: description || transcript || title });
        const detectedLanguage = language || detectLanguage(speechResult.transcript || transcript || description || title || '');
        const translation = await translateText(speechResult.transcript || transcript || description || title || '', detectedLanguage, target_language);

        const translatedTitle = title || (translation.translated_text ? String(translation.translated_text).slice(0, 120) : 'Complaint');
        const translatedDescription = description || translation.translated_text || speechResult.transcript || 'Complaint submitted';

        const payload = {
            ...req.body,
            title: translatedTitle,
            description: translatedDescription,
            original_language: detectedLanguage,
            language: target_language,
            original_text: speechResult.transcript || transcript || description || title || '',
            transcript_text: speechResult.transcript || transcript || description || title || '',
            translated_text: translation.translated_text || translatedDescription,
            audio_reference: audio_url || null,
            citizen_language: detectedLanguage,
            provider_status: translation.provider_status,
            provider: translation.provider,
        };

        const createReq = { ...req, body: payload };
        return createComplaint(createReq, res);
    } catch (err) {
        console.error('submitVoiceComplaint error:', err);
        return res.status(500).json({ error: 'Something went wrong while processing the voice complaint' });
    }
}

async function translateOfficerResponse(req, res) {
    try {
        const { id } = req.params;
        const { note, target_language } = req.body;
        const complaintResult = await pool.query('SELECT * FROM complaints WHERE id = $1', [id]);
        if (!complaintResult.rows.length) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const complaint = complaintResult.rows[0];
        const destinationLanguage = target_language || complaint.original_language || complaint.citizen_language || complaint.language || 'en';
        const translation = await translateOfficerNote(note, destinationLanguage);

        const updated = await pool.query(
            `UPDATE complaints SET response_translation = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [translation.translated_note || note, id]
        );

        return res.json({
            complaint_id: id,
            source_language: 'en',
            target_language: destinationLanguage,
            translated_note: translation.translated_note || note,
            provider_status: translation.provider_status,
            provider: translation.provider,
            complaint: updated.rows[0],
        });
    } catch (err) {
        console.error('translateOfficerResponse error:', err);
        return res.status(500).json({ error: 'Something went wrong while translating the officer response' });
    }
}
async function listComplaints(req, res) {
    try {
        const { status, department_id } = req.query;
        if (status && !VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status filter' });
        const conditions = [];
        const values = [];
        if (req.user.role === 'citizen') {
            values.push(req.user.id); conditions.push(`citizen_id = $${values.length}`);
        } else if (req.user.role === 'officer') {
            const officer = await pool.query('SELECT id, department_id FROM officers WHERE user_id = $1', [req.user.id]);
            if (!officer.rows.length) return res.status(403).json({ error: 'Officer profile not found' });
            values.push(officer.rows[0].department_id); conditions.push(`department_id = $${values.length}`);
        }
        if (status) { values.push(status); conditions.push(`status = $${values.length}`); }
        if (department_id) {
            if (req.user.role === 'officer' && department_id !== String(values[0])) return res.status(403).json({ error: 'You can only view your department complaints' });
            values.push(department_id); conditions.push(`department_id = $${values.length}`);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const result = await pool.query(`SELECT * FROM complaints ${whereClause} ORDER BY created_at DESC`, values);
        return res.json({ complaints: result.rows });
    } catch (err) {
        console.error('listComplaints error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching complaints' });
    }
}

async function getComplaint(req, res) {
    try {
        const complaint = req.complaint;
        const mediaResult = await pool.query('SELECT * FROM complaint_media WHERE complaint_id = $1 ORDER BY uploaded_at ASC', [complaint.id]);
        return res.json({ complaint, media: mediaResult.rows });
    } catch (err) {
        console.error('getComplaint error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching the complaint' });
    }
}

async function updateStatus(req, res) {
    try {
        const { status } = req.body;
        const complaint = req.complaint;
        if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
        const allowed = STATUS_TRANSITIONS[complaint.status] || [];
        if (!allowed.includes(status)) return res.status(409).json({ error: `Invalid status transition: ${complaint.status} -> ${status}` });

        const result = await pool.query(`UPDATE complaints SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [status, complaint.id]);
        const { ensureSlaTrackingForComplaint, getComplaintPrioritySnapshot } = require('../services/slaEscalation');
        const snapshot = await getComplaintPrioritySnapshot(complaint.id);
        const resolvedAt = status === 'resolved' || status === 'closed' ? new Date().toISOString() : null;
        const slaStatus = status === 'resolved' || status === 'closed' ? 'RESOLVED' : 'ACTIVE';
        await ensureSlaTrackingForComplaint(complaint.id, snapshot.priority_label || 'LOW', {
            status: slaStatus,
            resolved_at: resolvedAt,
            is_breached: false,
        });
        const clusterRow = await pool.query(`SELECT cluster_id FROM duplicate_cluster_members WHERE complaint_id = $1 LIMIT 1`, [complaint.id]);
        if (clusterRow.rows.length) {
            await refreshMasterIssueCluster(clusterRow.rows[0].cluster_id);
        }
        await logAudit(complaint.id, req.user.id, `STATUS_CHANGED_TO_${status.toUpperCase()}`, { from: complaint.status, status, sla_status: slaStatus });
        return res.json({ complaint: result.rows[0] });
    } catch (err) {
        console.error('updateStatus error:', err);
        return res.status(500).json({ error: 'Something went wrong while updating status' });
    }
}

async function addMedia(req, res) {
    try {
        const { file_url, type } = req.body;
        if (!file_url || !['image', 'video', 'audio'].includes(type)) {
            return res.status(400).json({ error: 'file_url is required and type must be image, video, or audio' });
        }
        const result = await pool.query(`INSERT INTO complaint_media (complaint_id,file_url,type) VALUES ($1,$2,$3) RETURNING *`, [req.complaint.id, file_url, type]);
        await logAudit(req.complaint.id, req.user.id, 'MEDIA_ATTACHED', { type });
        return res.status(201).json({ media: result.rows[0] });
    } catch (err) {
        console.error('addMedia error:', err);
        return res.status(500).json({ error: 'Something went wrong while attaching media' });
    }
}

async function uploadMedia(req, res) {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded (expected multipart field "file")' });
        const type = ALLOWED_MIME_TYPES[req.file.mimetype];
        const file_url = `/uploads/${req.file.filename}`;
        try {
            const result = await pool.query(`INSERT INTO complaint_media (complaint_id,file_url,type) VALUES ($1,$2,$3) RETURNING *`, [req.complaint.id, file_url, type]);
            await logAudit(req.complaint.id, req.user.id, 'MEDIA_UPLOADED', { type, file_url });
            return res.status(201).json({ media: result.rows[0] });
        } catch (dbErr) {
            fs.unlink(req.file.path, () => {});
            throw dbErr;
        }
    } catch (err) {
        console.error('uploadMedia error:', err);
        return res.status(500).json({ error: 'Something went wrong while uploading media' });
    }
}

async function confirmResolution(req, res) {
    try {
        const { confirmed, notes } = req.body;
        if (typeof confirmed !== 'boolean') return res.status(400).json({ error: 'confirmed must be true or false' });
        if (req.complaint.status !== 'resolved') return res.status(400).json({ error: 'This complaint has not been marked resolved by an officer yet' });
        const newStatus = confirmed ? 'closed' : 'reopened';
        const result = await pool.query(`UPDATE complaints SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [newStatus, req.complaint.id]);
        const { ensureSlaTrackingForComplaint, getComplaintPrioritySnapshot } = require('../services/slaEscalation');
        const snapshot = await getComplaintPrioritySnapshot(req.complaint.id);
        await ensureSlaTrackingForComplaint(req.complaint.id, snapshot.priority_label || 'LOW', {
            status: confirmed ? 'RESOLVED' : 'ACTIVE',
            resolved_at: confirmed ? new Date().toISOString() : null,
            is_breached: false,
        });
        await logAudit(req.complaint.id, req.user.id, confirmed ? 'CITIZEN_CONFIRMED_RESOLVED' : 'CITIZEN_REOPENED', { notes: notes || null, status: newStatus });
        return res.json({ complaint: result.rows[0] });
    } catch (err) {
        console.error('confirmResolution error:', err);
        return res.status(500).json({ error: 'Something went wrong while confirming resolution' });
    }
}

module.exports = { createComplaint, submitVoiceComplaint, translateOfficerResponse, listComplaints, getComplaint, updateStatus, addMedia, uploadMedia, confirmResolution };
