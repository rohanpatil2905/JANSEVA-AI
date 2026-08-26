const assert = require('node:assert/strict');
const { Pool } = require('pg');
const {
  addSeverityScore,
  addRoutingResult,
  addOfficerReview,
  getPendingReviews,
  getReviewHistory,
  getXaiExplanation,
} = require('../controllers/pipelineController');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role, is_verified)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id`,
    [name, email, '9999999999', 'placeholder-hash', role]
  );
  return result.rows[0].id;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for human-in-the-loop validation');
  }

  const citizenId = await ensureUniqueUser(`hil-citizen-${Date.now()}@example.com`, 'HIL Citizen');
  const officerUserId = await ensureUniqueUser(`hil-officer-${Date.now()}@example.com`, 'HIL Officer', 'officer');
  const departmentRow = await pool.query(`SELECT id FROM departments WHERE name = 'Water Supply' LIMIT 1`);
  if (!departmentRow.rows.length) {
    throw new Error('Water Supply department is missing');
  }

  const officerRow = await pool.query(
    `INSERT INTO officers (user_id, department_id, designation)
     VALUES ($1, $2, 'Ward Officer')
     ON CONFLICT (user_id) DO UPDATE SET department_id = EXCLUDED.department_id
     RETURNING id`,
    [officerUserId, departmentRow.rows[0].id]
  );
  const officerId = officerRow.rows[0].id;

  const complaintResult = await pool.query(
    `INSERT INTO complaints (citizen_id, department_id, title, description, status, latitude, longitude)
     VALUES ($1, $2, $3, $4, 'submitted', 12.9716, 77.5946)
     RETURNING id`,
    [citizenId, departmentRow.rows[0].id, 'Water outage in Ward 12', 'No drinking water in Ward 12; households are affected and the service is critical.']
  );
  const complaintId = complaintResult.rows[0].id;

  const severityReq = {
    params: { id: complaintId },
    body: {
      urgency_score: 90,
      affected_count_score: 80,
      vulnerability_score: 75,
      critical_infra_score: 80,
      duration_score: 75,
      recurrence_score: 60,
      level: 'CRITICAL',
      requires_review: true,
      xai_explanation: 'High urgency, critical service, vulnerable population, repeated disruption.',
    },
  };
  const severityRes = makeRes();
  await addSeverityScore(severityReq, severityRes);
  assert.equal(severityRes.statusCode, 201, 'Severity score should be persisted');

  const routingReq = {
    params: { id: complaintId },
    body: {
      routed_department_id: departmentRow.rows[0].id,
      routed_officer_id: officerId,
      ward: 'Ward 12',
      subdivision: 'Ward 12',
      confidence: 0.91,
      reason: 'Repeated water outage in Ward 12 affecting households and essential service continuity.',
    },
  };
  const routingRes = makeRes();
  await addRoutingResult(routingReq, routingRes);
  assert.equal(routingRes.statusCode, 201, 'Routing decision should be persisted');

  let reviewReq = {
    params: { id: complaintId },
    body: { action: 'FLAG_FOR_REVIEW', notes: 'Human verification required before final decision.' },
    user: { id: officerUserId },
  };
  let reviewRes = makeRes();
  await addOfficerReview(reviewReq, reviewRes);
  assert.equal(reviewRes.statusCode, 201, 'Review should be created in FLAG_FOR_REVIEW state');

  const pendingReviewReq = { user: { id: officerUserId, role: 'officer' }, query: {} };
  const pendingReviewRes = makeRes();
  await getPendingReviews(pendingReviewReq, pendingReviewRes);
  assert.ok(Array.isArray(pendingReviewRes.body.pending_reviews), 'Pending review list should be returned');

  reviewReq = {
    params: { id: complaintId },
    body: {
      action: 'MODIFY',
      modification_reason: 'Officer confirmed repeated outage but reduced urgency after validation.',
      final_decision: { status: 'MODIFIED', reason: 'validated by ward officer' },
      notes: 'Confirmed affected population and ward routing; updated final decision.'
    },
    user: { id: officerUserId },
  };
  reviewRes = makeRes();
  await addOfficerReview(reviewReq, reviewRes);
  assert.equal(reviewRes.statusCode, 201, 'Officer modification should be saved');

  const reviewHistoryReq = { params: { id: complaintId }, user: { id: officerUserId } };
  const reviewHistoryRes = makeRes();
  await getReviewHistory(reviewHistoryReq, reviewHistoryRes);
  assert.equal(reviewHistoryRes.body.reviews.length >= 2, true, 'Review history should show the flagged and modified review records');

  const xaiReq = { params: { id: complaintId } };
  const xaiRes = makeRes();
  await getXaiExplanation(xaiReq, xaiRes);
  assert.ok(xaiRes.body.explanation, 'XAI explanation payload should exist');
  assert.ok(xaiRes.body.explanation.severity, 'XAI severity explanation should exist');
  assert.ok(xaiRes.body.explanation.routing, 'XAI routing explanation should exist');

  const severityRow = await pool.query('SELECT review_status, level, requires_review FROM severity_scores WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [complaintId]);
  const routingRow = await pool.query('SELECT review_status, requires_review, final_decision FROM routing_results WHERE complaint_id = $1 ORDER BY created_at DESC LIMIT 1', [complaintId]);
  const reviewRows = await pool.query('SELECT action, final_decision FROM officer_reviews WHERE complaint_id = $1 ORDER BY created_at ASC', [complaintId]);

  assert.equal(severityRow.rows[0].review_status, 'MODIFIED', 'Severity should be updated after human review');
  assert.equal(routingRow.rows[0].review_status, 'MODIFIED', 'Routing should be updated after human review');
  assert.ok(reviewRows.rows.some((row) => row.action === 'FLAG_FOR_REVIEW'), 'FLAG_FOR_REVIEW action should be persisted');
  assert.ok(reviewRows.rows.some((row) => row.action === 'MODIFY'), 'MODIFY action should be persisted');

  console.log('HIL+XAI validation passed.');
  console.log(JSON.stringify({
    complaint_id: complaintId,
    severity_review_status: severityRow.rows[0].review_status,
    routing_review_status: routingRow.rows[0].review_status,
    review_actions: reviewRows.rows.map((row) => row.action),
    xai_coverage: Object.keys(xaiRes.body.explanation),
  }, null, 2));

  await pool.query('DELETE FROM officer_reviews WHERE complaint_id = $1', [complaintId]);
  await pool.query('DELETE FROM routing_results WHERE complaint_id = $1', [complaintId]);
  await pool.query('DELETE FROM severity_scores WHERE complaint_id = $1', [complaintId]);
  await pool.query('DELETE FROM ai_predictions WHERE complaint_id = $1', [complaintId]);
  await pool.query('DELETE FROM complaints WHERE id = $1', [complaintId]);
  await pool.query('DELETE FROM officers WHERE id = $1', [officerId]);
  await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [citizenId, officerUserId]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}).finally(() => pool.end());
