// db/auditLog.js
// Call this any time something significant happens to a complaint.
// Keeps the audit trail consistent instead of writing raw INSERTs everywhere.

const pool = require('./pool');

async function logAudit(complaint_id, actor_id, action, details = null) {
    try {
        await pool.query(
            `INSERT INTO audit_logs (complaint_id, actor_id, action, details)
             VALUES ($1, $2, $3, $4)`,
            [complaint_id, actor_id || null, action, details ? JSON.stringify(details) : null]
        );
    } catch (err) {
        // Never let a logging failure break the main request
        console.error('logAudit error:', err);
    }
}

module.exports = { logAudit };
