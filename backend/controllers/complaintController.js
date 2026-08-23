// controllers/complaintController.js
const pool = require('../db/pool');
const { logAudit } = require('../db/auditLog');
const fs = require('fs');
const { ALLOWED_MIME_TYPES } = require('../middleware/upload');

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
        const { title, description, category_id, latitude, longitude } = req.body;
        if (!title || !description) return res.status(400).json({ error: 'title and description are required' });
        if (String(title).length > 200) return res.status(400).json({ error: 'title must be 200 characters or fewer' });
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
        const result = await pool.query(
            `INSERT INTO complaints
                (citizen_id, category_id, department_id, title, description, latitude, longitude, tracking_code)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [citizen_id, category_id || null, department_id, title, description,
             latitude === '' ? null : latitude, longitude === '' ? null : longitude, tracking_code]
        );

        const complaint = result.rows[0];
        await logAudit(complaint.id, citizen_id, 'SUBMITTED', { title, category_id: category_id || null });
        return res.status(201).json({ complaint });
    } catch (err) {
        console.error('createComplaint error:', err);
        return res.status(500).json({ error: 'Something went wrong while creating the complaint' });
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
        await logAudit(complaint.id, req.user.id, `STATUS_CHANGED_TO_${status.toUpperCase()}`, { from: complaint.status, status });
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
        await logAudit(req.complaint.id, req.user.id, confirmed ? 'CITIZEN_CONFIRMED_RESOLVED' : 'CITIZEN_REOPENED', { notes: notes || null });
        return res.json({ complaint: result.rows[0] });
    } catch (err) {
        console.error('confirmResolution error:', err);
        return res.status(500).json({ error: 'Something went wrong while confirming resolution' });
    }
}

module.exports = { createComplaint, listComplaints, getComplaint, updateStatus, addMedia, uploadMedia, confirmResolution };
