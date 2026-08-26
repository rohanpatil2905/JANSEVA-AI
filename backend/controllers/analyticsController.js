const pool = require('../db/pool');

async function getOfficerAnalytics(req, res) {
    try {
        const [totalRow, pendingRow, resolvedRow, criticalHighRow, breachedRow, deptRows, categoryRows, avgResolutionRow, masterStatsRow] = await Promise.all([
            pool.query('SELECT COUNT(*)::int AS total FROM complaints'),
            pool.query("SELECT COUNT(*)::int AS total FROM complaints WHERE status IN ('submitted', 'in_progress', 'reopened')"),
            pool.query("SELECT COUNT(*)::int AS total FROM complaints WHERE status IN ('resolved', 'closed')"),
            pool.query(`SELECT COUNT(*)::int AS total
                FROM complaints c
                LEFT JOIN LATERAL (
                    SELECT level FROM severity_scores WHERE complaint_id = c.id ORDER BY created_at DESC LIMIT 1
                ) ss ON true
                WHERE COALESCE(ss.level, 'LOW') IN ('HIGH', 'CRITICAL')`),
            pool.query('SELECT COUNT(*)::int AS total FROM sla_tracking WHERE is_breached = true OR status = \'BREACHED\''),
            pool.query(`SELECT d.name AS department, COUNT(c.id)::int AS complaint_count
                FROM complaints c
                LEFT JOIN departments d ON d.id = c.department_id
                GROUP BY d.name
                ORDER BY complaint_count DESC, department NULLS LAST`),
            pool.query(`SELECT cat.name AS category, COUNT(c.id)::int AS complaint_count
                FROM complaints c
                LEFT JOIN categories cat ON cat.id = c.category_id
                GROUP BY cat.name
                ORDER BY complaint_count DESC, category NULLS LAST`),
            pool.query(`SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - started_at)) / 3600), 0)::float AS average_resolution_hours
                FROM sla_tracking
                WHERE resolved_at IS NOT NULL`),
            pool.query(`SELECT
                COUNT(*)::int AS master_issue_count,
                COALESCE(SUM(dc.affected_count), 0)::int AS affected_complaint_count,
                COALESCE(COUNT(DISTINCT c.citizen_id), 0)::int AS affected_citizen_count
                FROM duplicate_clusters dc
                LEFT JOIN duplicate_cluster_members dcm ON dcm.cluster_id = dc.id
                LEFT JOIN complaints c ON c.id = dcm.complaint_id`),
        ]);

        return res.json({
            total_complaints: totalRow.rows[0]?.total || 0,
            pending_complaints: pendingRow.rows[0]?.total || 0,
            resolved_complaints: resolvedRow.rows[0]?.total || 0,
            critical_high_complaints: criticalHighRow.rows[0]?.total || 0,
            sla_breached: breachedRow.rows[0]?.total || 0,
            department_counts: deptRows.rows,
            category_counts: categoryRows.rows,
            average_resolution_hours: avgResolutionRow.rows[0]?.average_resolution_hours || 0,
            master_issue_stats: {
                master_issue_count: masterStatsRow.rows[0]?.master_issue_count || 0,
                affected_complaint_count: masterStatsRow.rows[0]?.affected_complaint_count || 0,
                affected_citizen_count: masterStatsRow.rows[0]?.affected_citizen_count || 0,
            },
        });
    } catch (err) {
        console.error('getOfficerAnalytics error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching officer analytics' });
    }
}

async function getComplaintTimeline(req, res) {
    try {
        const { id } = req.params;
        const complaintCheck = await pool.query('SELECT id FROM complaints WHERE id = $1', [id]);
        if (!complaintCheck.rows.length) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        const result = await pool.query(
            `SELECT
                al.complaint_id,
                al.action,
                al.actor_id,
                al.created_at,
                al.details,
                u.name AS actor_name
             FROM audit_logs al
             LEFT JOIN users u ON u.id = al.actor_id
             WHERE al.complaint_id = $1
             ORDER BY al.created_at ASC`,
            [id]
        );

        const timeline = result.rows.map((row) => ({
            complaint_id: row.complaint_id,
            action: row.action,
            actor_id: row.actor_id,
            actor_name: row.actor_name || null,
            timestamp: row.created_at,
            reason: row.details ? (row.details.reason || row.details.note || row.details.final_decision || null) : null,
            details: row.details || null,
        }));

        return res.json({ complaint_id: id, timeline });
    } catch (err) {
        console.error('getComplaintTimeline error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching the complaint timeline' });
    }
}

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

        return res.json({ complaint_id: id, audit_trail: result.rows });
    } catch (err) {
        console.error('getAuditTrail error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching the audit trail' });
    }
}

async function getNotifications(req, res) {
    try {
        const critical = await pool.query(`
            SELECT c.id AS complaint_id, c.title, c.status, ss.level AS severity, c.created_at
            FROM complaints c
            LEFT JOIN LATERAL (
                SELECT level FROM severity_scores WHERE complaint_id = c.id ORDER BY created_at DESC LIMIT 1
            ) ss ON true
            WHERE COALESCE(ss.level, 'LOW') IN ('HIGH', 'CRITICAL')
            ORDER BY c.created_at DESC
            LIMIT 20`);

        const slaBreaches = await pool.query(`
            SELECT st.complaint_id, st.priority_label, st.deadline, st.current_escalation_level, st.escalation_reason
            FROM sla_tracking st
            WHERE st.is_breached = true OR st.status = 'BREACHED'
            ORDER BY st.deadline ASC`);

        const escalations = await pool.query(`
            SELECT complaint_id, escalation_level, reason, escalated_at
            FROM sla_escalations
            ORDER BY escalated_at DESC
            LIMIT 20`);

        const reviewRequired = await pool.query(`
            SELECT c.id AS complaint_id, c.title, c.status,
                   COALESCE(ss.level, 'LOW') AS severity,
                   rr.review_status,
                   rr.reason
            FROM complaints c
            LEFT JOIN LATERAL (
                SELECT level FROM severity_scores WHERE complaint_id = c.id ORDER BY created_at DESC LIMIT 1
            ) ss ON true
            LEFT JOIN LATERAL (
                SELECT review_status, reason FROM routing_results WHERE complaint_id = c.id ORDER BY created_at DESC LIMIT 1
            ) rr ON true
            WHERE COALESCE(ss.level, 'LOW') IN ('HIGH', 'CRITICAL')
               OR COALESCE(rr.review_status, 'PENDING') = 'PENDING'
            ORDER BY c.created_at DESC`);

        const resolved = await pool.query(`
            SELECT c.id AS complaint_id, c.title, c.status, c.updated_at
            FROM complaints c
            WHERE c.status IN ('resolved', 'closed')
            ORDER BY c.updated_at DESC
            LIMIT 20`);

        return res.json({
            notifications: {
                critical_complaints: critical.rows.map((row) => ({ type: 'NEW_CRITICAL_COMPLAINT', ...row })),
                sla_breaches: slaBreaches.rows.map((row) => ({ type: 'SLA_BREACH', ...row })),
                escalations: escalations.rows.map((row) => ({ type: 'ESCALATION', ...row })),
                review_required: reviewRequired.rows.map((row) => ({ type: 'OFFICER_REVIEW_REQUIRED', ...row })),
                resolutions: resolved.rows.map((row) => ({ type: 'RESOLUTION', ...row })),
            },
        });
    } catch (err) {
        console.error('getNotifications error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching notifications' });
    }
}

module.exports = {
    getOfficerAnalytics,
    getComplaintTimeline,
    getAuditTrail,
    getNotifications,
};
