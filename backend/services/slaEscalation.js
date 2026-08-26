// services/slaEscalation.js
//
// SLA + escalation support for the existing complaint pipeline. This is the
// canonical SLA implementation for the product: it persists deadlines and state,
// evaluates breaches, and escalates complaints through the configured hierarchy.

const pool = require('../db/pool');
const { logAudit } = require('../db/auditLog');

const ESCALATION_LEVELS = [
    'Ward Officer',
    'Department/Subdivision Head',
    'Senior Department Authority',
];

const SLA_HOURS_BY_PRIORITY = { LOW: 336, MEDIUM: 168, HIGH: 72, CRITICAL: 24 };
const ESCALATION_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function nextPriority(current) {
    const idx = ESCALATION_ORDER.indexOf(current);
    if (idx === -1 || idx === ESCALATION_ORDER.length - 1) return current;
    return ESCALATION_ORDER[idx + 1];
}

function calculateSlaDeadline(priorityLabel = 'LOW') {
    const hours = SLA_HOURS_BY_PRIORITY[String(priorityLabel).toUpperCase()] || SLA_HOURS_BY_PRIORITY.LOW;
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function resolvePriorityLabel(priorityLabel, fallback = 'LOW') {
    const label = String(priorityLabel || fallback).toUpperCase();
    return ESCALATION_ORDER.includes(label) ? label : fallback;
}

async function ensureSlaTrackingForComplaint(complaintId, priorityLabel = 'LOW', options = {}) {
    const normalizedPriority = resolvePriorityLabel(priorityLabel, 'LOW');
    const deadline = options.deadline || calculateSlaDeadline(normalizedPriority);
    const startedAt = options.started_at || new Date().toISOString();
    const existing = await pool.query('SELECT * FROM sla_tracking WHERE complaint_id = $1', [complaintId]);

    if (existing.rows.length) {
        const row = existing.rows[0];
        const status = options.status || row.status || 'ACTIVE';
        const updated = await pool.query(
           `UPDATE sla_tracking
            SET priority_label = $2,
                status = $3,
                deadline = $4,
                started_at = COALESCE(started_at, $5),
                resolved_at = $6,
                is_breached = COALESCE($7, is_breached),
                escalated_at = COALESCE($8, escalated_at),
                current_escalation_level = COALESCE($9, current_escalation_level),
                escalation_reason = COALESCE($10, escalation_reason)
            WHERE complaint_id = $1
            RETURNING *`,
           [complaintId, normalizedPriority, status, deadline, startedAt, options.resolved_at || row.resolved_at || null, options.is_breached ?? row.is_breached ?? false, options.escalated_at || row.escalated_at || null, options.current_escalation_level || row.current_escalation_level || null, options.escalation_reason || row.escalation_reason || null]
        );
        return updated.rows[0];
    }

    const row = await pool.query(
        `INSERT INTO sla_tracking (complaint_id, priority_label, status, deadline, started_at, resolved_at, is_breached, escalated_at, current_escalation_level, escalation_reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [complaintId, normalizedPriority, options.status || 'ACTIVE', deadline, startedAt, options.resolved_at || null, options.is_breached || false, options.escalated_at || null, options.current_escalation_level || null, options.escalation_reason || null]
    );
    return row.rows[0];
}

async function getComplaintPrioritySnapshot(complaintId) {
    const { rows } = await pool.query(
        `SELECT c.id,
               COALESCE(ss.priority_label, dc.priority, 'LOW') AS priority_label,
               ss.final_score,
               dc.priority AS cluster_priority,
               dc.id AS cluster_id
         FROM complaints c
         LEFT JOIN LATERAL (
             SELECT priority_label, final_score
             FROM severity_scores
             WHERE complaint_id = c.id
             ORDER BY created_at DESC
             LIMIT 1
         ) ss ON true
         LEFT JOIN LATERAL (
             SELECT dc.priority, dc.id
             FROM duplicate_cluster_members dcm
             JOIN duplicate_clusters dc ON dc.id = dcm.cluster_id
             WHERE dcm.complaint_id = c.id
             LIMIT 1
         ) dc ON true
         WHERE c.id = $1`,
        [complaintId]
    );
    return rows[0] || { priority_label: 'LOW', final_score: 0, cluster_priority: null, cluster_id: null };
}

async function getComplaintSlaStatus(complaintId) {
    const slaRow = await pool.query(
        `SELECT st.*, (
           SELECT json_agg(se ORDER BY se.escalated_at ASC)
           FROM sla_escalations se
           WHERE se.complaint_id = st.complaint_id
         ) AS escalations
         FROM sla_tracking st
         WHERE st.complaint_id = $1`,
        [complaintId]
    );

    if (!slaRow.rows.length) {
        const snapshot = await getComplaintPrioritySnapshot(complaintId);
        return {
           complaint_id: complaintId,
           priority_label: resolvePriorityLabel(snapshot.priority_label, 'LOW'),
           deadline: null,
           status: 'NOT_STARTED',
           is_breached: false,
           started_at: null,
           resolved_at: null,
           current_escalation_level: null,
           escalation_reason: null,
           escalations: [],
        };
    }

    const row = slaRow.rows[0];
    return {
        complaint_id: complaintId,
        priority_label: row.priority_label,
        deadline: row.deadline,
        status: row.status,
        started_at: row.started_at,
        resolved_at: row.resolved_at,
        is_breached: row.is_breached,
        current_escalation_level: row.current_escalation_level,
        escalation_reason: row.escalation_reason,
        escalations: row.escalations || [],
    };
}

function getEscalationLevelForIndex(index) {
    return ESCALATION_LEVELS[index] || ESCALATION_LEVELS[ESCALATION_LEVELS.length - 1];
}

async function runEscalationSweep() {
    const { rows: overdue } = await pool.query(
        `SELECT s.complaint_id,
               s.deadline,
               s.status,
               s.current_escalation_level,
               s.priority_label,
               c.status AS complaint_status,
               COALESCE(ss.priority_label, dc.priority, 'LOW') AS effective_priority,
               ss.id AS severity_id
         FROM sla_tracking s
         JOIN complaints c ON c.id = s.complaint_id
         LEFT JOIN LATERAL (
             SELECT id, priority_label FROM severity_scores
             WHERE complaint_id = s.complaint_id
             ORDER BY created_at DESC LIMIT 1
         ) ss ON true
         LEFT JOIN LATERAL (
             SELECT dc.priority
             FROM duplicate_cluster_members dcm
             JOIN duplicate_clusters dc ON dc.id = dcm.cluster_id
             WHERE dcm.complaint_id = s.complaint_id
             LIMIT 1
         ) dc ON true
         WHERE s.status IN ('ACTIVE', 'BREACHED')
           AND c.status NOT IN ('resolved', 'closed')
           AND s.deadline < NOW()`
    );

    const escalated = [];
    for (const row of overdue) {
        const effectivePriority = resolvePriorityLabel(row.effective_priority || row.priority_label || 'LOW', 'LOW');
        const escalationIndex = ESCALATION_LEVELS.indexOf(row.current_escalation_level || '') + 1;
        const nextLevel = getEscalationLevelForIndex(Math.max(0, escalationIndex));
        const reason = `Complaint exceeded SLA deadline for ${effectivePriority} severity. Escalated to ${nextLevel}.`;

        await pool.query(
           `UPDATE sla_tracking
            SET status = 'BREACHED',
                is_breached = TRUE,
                escalated_at = NOW(),
                current_escalation_level = $2,
                escalation_reason = $3
            WHERE complaint_id = $1`,
           [row.complaint_id, nextLevel, reason]
        );

        await pool.query(
           `INSERT INTO sla_escalations (complaint_id, escalation_level, reason)
            VALUES ($1, $2, $3)`,
           [row.complaint_id, nextLevel, reason]
        );

        if (row.severity_id) {
           const bumped = nextPriority(effectivePriority);
           await pool.query(
               `UPDATE severity_scores SET priority_label = $1 WHERE id = $2`,
               [bumped, row.severity_id]
           );
        }

        await logAudit(row.complaint_id, null, 'SLA_BREACHED_ESCALATED', {
           deadline: row.deadline,
           severity: effectivePriority,
           escalation_level: nextLevel,
           reason,
        });
        escalated.push({ complaint_id: row.complaint_id, escalation_level: nextLevel, reason });
    }

    return escalated;
}

function startEscalationTimer(intervalMs = 5 * 60 * 1000) {
    setInterval(() => {
        runEscalationSweep().catch((err) => console.error('SLA escalation sweep failed:', err));
    }, intervalMs);
}

module.exports = {
    SLA_HOURS_BY_PRIORITY,
    calculateSlaDeadline,
    ensureSlaTrackingForComplaint,
    getComplaintSlaStatus,
    runEscalationSweep,
    startEscalationTimer,
    getComplaintPrioritySnapshot,
    nextPriority,
};
