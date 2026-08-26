const assert = require('node:assert/strict');
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/janseva';
const { Pool } = require('pg');
const { getOfficerAnalytics, getComplaintTimeline, getAuditTrail, getNotifications } = require('../controllers/analyticsController');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function ensureUniqueUser(email, name, role = 'citizen') {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return existing.rows[0].id;
  const created = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id`,
    [name, email, '9999999999', 'placeholder-hash', role]
  );
  return created.rows[0].id;
}

async function ensureDepartment(name) {
  const existing = await pool.query('SELECT id FROM departments WHERE name = $1', [name]);
  if (existing.rows.length) return existing.rows[0].id;
  const created = await pool.query('INSERT INTO departments (name) VALUES ($1) RETURNING id', [name]);
  return created.rows[0].id;
}

async function ensureCategory(name, departmentId) {
  const existing = await pool.query('SELECT id FROM categories WHERE name = $1', [name]);
  if (existing.rows.length) return existing.rows[0].id;
  const created = await pool.query(
    'INSERT INTO categories (name, department_id) VALUES ($1, $2) RETURNING id',
    [name, departmentId]
  );
  return created.rows[0].id;
}

async function ensureOfficer(userId, departmentId) {
  const existing = await pool.query('SELECT id FROM officers WHERE user_id = $1', [userId]);
  if (existing.rows.length) return existing.rows[0].id;
  const created = await pool.query(
    'INSERT INTO officers (user_id, department_id, designation) VALUES ($1, $2, $3) RETURNING id',
    [userId, departmentId, 'Water Operations Officer']
  );
  return created.rows[0].id;
}

async function insertComplaint(citizenId, categoryId, departmentId, officerId, title, description, address) {
  const result = await pool.query(
    `INSERT INTO complaints (citizen_id, category_id, department_id, assigned_officer_id, title, description, status, latitude, longitude, location_address, language, original_language)
     VALUES ($1, $2, $3, $4, $5, $6, 'submitted', 12.9716, 77.5946, $7, 'en', 'en')
     RETURNING id`,
    [citizenId, categoryId, departmentId, officerId, title, description, address]
  );
  return result.rows[0].id;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

  const citizenId = await ensureUniqueUser(`analytics-citizen-${Date.now()}@example.com`, 'Analytics Citizen');
  const officerUserId = await ensureUniqueUser(`analytics-officer-${Date.now()}@example.com`, 'Analytics Officer', 'officer');
  const departmentId = await ensureDepartment('Water Supply');
  const categoryId = await ensureCategory('No water supply', departmentId);
  const officerId = await ensureOfficer(officerUserId, departmentId);

  const complaintIds = [];
  for (const entry of [
    {
      title: 'Ward 12 water outage',
      description: 'No water supply in Ward 12 for 3 days affecting many houses.',
      address: 'Ward 12, Bengaluru',
      severity: 'CRITICAL',
      priority: 'CRITICAL',
      review: 'APPROVED',
    },
    {
      title: 'Street water contamination',
      description: 'Dirty water flowing through the pipeline in Ward 12.',
      address: 'Ward 12, Bengaluru',
      severity: 'HIGH',
      priority: 'HIGH',
      review: 'PENDING',
    }
  ]) {
    const complaintId = await insertComplaint(citizenId, categoryId, departmentId, officerId, entry.title, entry.description, entry.address);
    complaintIds.push(complaintId);

    await pool.query(
      `INSERT INTO severity_scores (complaint_id, urgency_score, affected_count_score, vulnerability_score, critical_infra_score, duration_score, recurrence_score, final_score, level, priority_label, factors, explanation_json, xai_explanation, requires_review, review_status)
       VALUES ($1, 88, 90, 72, 85, 76, 68, 82.5, $2, $3, '{"urgency":88,"duration":76,"affected_population":90,"vulnerability":72,"essential_service":85,"recurrence":68}', '{"urgency":"Critical risk to households","essential_service":"Water is essential"}', 'Critical water outage with widespread impact.', true, $4)`,
      [complaintId, entry.severity, entry.priority, entry.review]
    );

    await pool.query(
      `INSERT INTO routing_results (complaint_id, routed_department_id, routed_officer_id, ward, subdivision, confidence, reason, requires_review, review_status, final_decision)
       VALUES ($1, $2, $3, 'Ward 12', 'Ward 12', 0.92, 'Water is essential and multiple households are impacted.', true, $4, 'Approved through backend validation')`,
      [complaintId, departmentId, officerId, entry.review]
    );

    await pool.query(
      `INSERT INTO audit_logs (complaint_id, actor_id, action, details)
       VALUES ($1, $2, 'AI_CLASSIFIED', '{"reason":"Water supply issue"}')`,
      [complaintId, officerUserId]
    );

    await pool.query(
      `INSERT INTO audit_logs (complaint_id, actor_id, action, details)
       VALUES ($1, $2, 'ROUTED', '{"department":"Water Supply","ward":"Ward 12"}')`,
      [complaintId, officerUserId]
    );
  }

  const breachComplaintId = complaintIds[0];
  await pool.query(
    `INSERT INTO sla_tracking (complaint_id, priority_label, status, deadline, started_at, resolved_at, is_breached, escalated_at, current_escalation_level, escalation_reason)
     VALUES ($1, 'CRITICAL', 'BREACHED', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 days', NULL, true, NOW(), 'Ward Officer', 'Escalated due to overdue critical water outage')
     ON CONFLICT (complaint_id) DO UPDATE SET
       priority_label = EXCLUDED.priority_label,
       status = EXCLUDED.status,
       deadline = EXCLUDED.deadline,
       started_at = EXCLUDED.started_at,
       resolved_at = EXCLUDED.resolved_at,
       is_breached = EXCLUDED.is_breached,
       escalated_at = EXCLUDED.escalated_at,
       current_escalation_level = EXCLUDED.current_escalation_level,
       escalation_reason = EXCLUDED.escalation_reason`,
    [breachComplaintId]
  );

  const clusterResult = await pool.query(
    `INSERT INTO duplicate_clusters (representative_complaint_id, category, location, severity, status, affected_count, priority)
     VALUES ($1, 'No water supply', 'Ward 12, Bengaluru', 'CRITICAL', 'open', $2, 'CRITICAL')
     RETURNING id`,
    [breachComplaintId, complaintIds.length]
  );

  const clusterId = clusterResult.rows[0].id;
  for (const complaintId of complaintIds) {
    await pool.query(
      `INSERT INTO duplicate_cluster_members (cluster_id, complaint_id, similarity_score)
       VALUES ($1, $2, 0.94)
       ON CONFLICT (cluster_id, complaint_id) DO UPDATE SET similarity_score = EXCLUDED.similarity_score`,
      [clusterId, complaintId]
    );
  }

  const analyticsReq = {}; const analyticsRes = makeRes();
  await getOfficerAnalytics(analyticsReq, analyticsRes);
  assert.equal(analyticsRes.statusCode, 200, 'Analytics endpoint should resolve successfully');
  assert.ok(analyticsRes.body.total_complaints >= complaintIds.length, 'Analytics should include created complaints');
  assert.ok(analyticsRes.body.critical_high_complaints >= 1, 'Analytics should count critical/high complaints');
  assert.ok(analyticsRes.body.sla_breached >= 1, 'Analytics should count breached SLA complaints');
  assert.ok(Array.isArray(analyticsRes.body.department_counts), 'Department counts should be an array');
  assert.ok(Array.isArray(analyticsRes.body.category_counts), 'Category counts should be an array');
  assert.ok(analyticsRes.body.master_issue_stats.master_issue_count >= 1, 'Master issue stats should include created master issue');

  const timelineReq = { params: { id: breachComplaintId } }; const timelineRes = makeRes();
  await getComplaintTimeline(timelineReq, timelineRes);
  assert.equal(timelineRes.statusCode, 200, 'Complaint timeline should resolve successfully');
  assert.ok(Array.isArray(timelineRes.body.timeline), 'Timeline should contain an array of events');
  assert.ok(timelineRes.body.timeline.length >= 2, 'Timeline should include at least two events');

  const auditReq = { params: { id: breachComplaintId } }; const auditRes = makeRes();
  await getAuditTrail(auditReq, auditRes);
  assert.equal(auditRes.statusCode, 200, 'Audit trail should resolve successfully');
  assert.ok(Array.isArray(auditRes.body.audit_trail), 'Audit trail should be an array');
  assert.ok(auditRes.body.audit_trail.length >= 2, 'Audit trail should include events');

  const notificationsReq = {}; const notificationsRes = makeRes();
  await getNotifications(notificationsReq, notificationsRes);
  assert.equal(notificationsRes.statusCode, 200, 'Notifications should resolve successfully');
  assert.ok(Array.isArray(notificationsRes.body.notifications.critical_complaints), 'Critical complaints notifications should be an array');
  assert.ok(Array.isArray(notificationsRes.body.notifications.sla_breaches), 'SLA breach notifications should be an array');
  assert.ok(Array.isArray(notificationsRes.body.notifications.review_required), 'Review-required notifications should be an array');

  console.log('Officer analytics validation passed.');
  console.log(JSON.stringify({
    complaint_ids: complaintIds,
    analytics: analyticsRes.body,
    timeline_count: timelineRes.body.timeline.length,
    audit_count: auditRes.body.audit_trail.length,
    notifications: {
      critical: notificationsRes.body.notifications.critical_complaints.length,
      sla_breaches: notificationsRes.body.notifications.sla_breaches.length,
      review_required: notificationsRes.body.notifications.review_required.length,
    },
  }, null, 2));

  await pool.query('DELETE FROM duplicate_cluster_members WHERE cluster_id = $1', [clusterId]);
  await pool.query('DELETE FROM duplicate_clusters WHERE id = $1', [clusterId]);
  await pool.query('DELETE FROM sla_tracking WHERE complaint_id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM audit_logs WHERE complaint_id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM routing_results WHERE complaint_id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM severity_scores WHERE complaint_id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM complaints WHERE id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM officers WHERE user_id = $1', [officerUserId]);
  await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [citizenId, officerUserId]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}).finally(() => pool.end());
