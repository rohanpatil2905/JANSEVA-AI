// middleware/complaintAccess.js
// Centralizes complaint-level authorization so every endpoint applies the same rules.

const pool = require('../db/pool');

async function getComplaintForRequest(req, res, next) {
    try {
        const result = await pool.query('SELECT * FROM complaints WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Complaint not found' });
        req.complaint = result.rows[0];
        next();
    } catch (err) {
        console.error('getComplaintForRequest error:', err);
        return res.status(500).json({ error: 'Unable to load complaint' });
    }
}

async function requireComplaintAccess(req, res, next) {
    try {
        if (!req.complaint) return res.status(500).json({ error: 'Complaint context missing' });
        const complaint = req.complaint;

        if (req.user.role === 'admin') return next();
        if (req.user.role === 'citizen') {
            if (complaint.citizen_id !== req.user.id) return res.status(403).json({ error: 'You do not have access to this complaint' });
            return next();
        }
        if (req.user.role === 'officer') {
            const officer = await pool.query('SELECT id, department_id FROM officers WHERE user_id = $1', [req.user.id]);
            if (!officer.rows.length) return res.status(403).json({ error: 'Officer profile not found' });
            const o = officer.rows[0];
            if (complaint.assigned_officer_id === o.id || (o.department_id && complaint.department_id === o.department_id)) {
                req.officer = o;
                return next();
            }
            return res.status(403).json({ error: 'This complaint is outside your assigned department' });
        }
        return res.status(403).json({ error: 'You do not have access to this complaint' });
    } catch (err) {
        console.error('requireComplaintAccess error:', err);
        return res.status(500).json({ error: 'Unable to authorize complaint access' });
    }
}

module.exports = { getComplaintForRequest, requireComplaintAccess };
