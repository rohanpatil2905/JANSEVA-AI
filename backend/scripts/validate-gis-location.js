const assert = require('node:assert/strict');
const { Pool } = require('pg');
const { getComplaintMap, getComplaintHotspots, getComplaintLocation } = require('../controllers/gisController');

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

async function ensureLocationColumns() {
  await pool.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS location_address TEXT');
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

async function insertComplaint(citizenId, departmentId, title, description, lat, lng, address) {
  const result = await pool.query(
    `INSERT INTO complaints (citizen_id, department_id, title, description, status, latitude, longitude, location_address)
     VALUES ($1, $2, $3, $4, 'submitted', $5, $6, $7)
     RETURNING id`,
    [citizenId, departmentId, title, description, lat, lng, address]
  );
  return result.rows[0].id;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  await ensureLocationColumns();

  const citizenId = await ensureUniqueUser(`gis-citizen-${Date.now()}@example.com`, 'GIS Citizen');
  const departmentId = await ensureDepartment('Water Supply');

  const complaintIds = [];
  const coords = [
    { title: 'Ward 12 water outage 1', description: 'No water in Ward 12 for two days', lat: 12.9716, lng: 77.5946, address: 'Ward 12, Bengaluru' },
    { title: 'Ward 12 water outage 2', description: 'Tap water cut in Ward 12 for the fourth day', lat: 12.9718, lng: 77.5941, address: 'Ward 12, Bengaluru' },
    { title: 'Ward 12 water outage 3', description: 'Residents in Ward 12 have no drinking water', lat: 12.9721, lng: 77.5945, address: 'Ward 12, Bengaluru' },
  ];

  for (const record of coords) {
    const id = await insertComplaint(citizenId, departmentId, record.title, record.description, record.lat, record.lng, record.address);
    complaintIds.push(id);

    await pool.query(
      `INSERT INTO severity_scores (complaint_id, urgency_score, affected_count_score, vulnerability_score, critical_infra_score, duration_score, recurrence_score, final_score, level, priority_label, factors, explanation_json, xai_explanation, requires_review, review_status)
       VALUES ($1, 80, 75, 60, 70, 70, 50, 77.5, 'HIGH', 'HIGH', '{"urgency":80,"duration":70,"affected_population":75,"vulnerability":60,"essential_service":70,"recurrence":50}', '{"urgency":"High urgency / immediate public risk"}', 'High urgency and essential service disruption.', true, 'APPROVED')`,
      [id]
    );

    await pool.query(
      `INSERT INTO routing_results (complaint_id, routed_department_id, routed_officer_id, ward, subdivision, confidence, reason, requires_review, review_status)
       VALUES ($1, $2, $3, 'Ward 12', 'Ward 12', 0.9, 'Water outage affecting households in Ward 12.', false, 'APPROVED')`,
      [id, departmentId, null]
    );
  }

  const clusterResult = await pool.query(
    `INSERT INTO duplicate_clusters (representative_complaint_id, category, location, severity, status, affected_count, priority)
     VALUES ($1, 'No water supply', 'Ward 12, Bengaluru', 'HIGH', 'open', $2, 'HIGH')
     RETURNING id`,
    [complaintIds[0], complaintIds.length]
  );
  const clusterId = clusterResult.rows[0].id;

  for (const complaintId of complaintIds) {
    await pool.query(
      `INSERT INTO duplicate_cluster_members (cluster_id, complaint_id, similarity_score)
       VALUES ($1, $2, 0.92)
       ON CONFLICT (cluster_id, complaint_id) DO UPDATE SET similarity_score = EXCLUDED.similarity_score`,
      [clusterId, complaintId]
    );
  }

  const mapReq = {}; const mapRes = makeRes();
  await getComplaintMap(mapReq, mapRes);
  assert.ok(Array.isArray(mapRes.body.complaints), 'Map response should contain complaint records');
  assert.ok(mapRes.body.complaints.length >= 3, 'Expected multiple Ward 12 complaints in map response');
  for (const entry of mapRes.body.complaints) {
    assert.ok(entry.complaint_id, 'Map entry must include complaint_id');
    assert.ok(entry.latitude != null && entry.longitude != null, 'Map entry must include lat/lng');
    assert.ok(entry.category, 'Map entry must include category');
    assert.ok(entry.severity, 'Map entry must include severity');
    assert.ok(entry.master_issue_id || entry.master_issue_id === null, 'Map entry must include master_issue_id');
    assert.ok(entry.location || entry.master_issue_location || entry.latitude, 'Map entry must include location details');
  }

  const hotspotsReq = {}; const hotspotsRes = makeRes();
  await getComplaintHotspots(hotspotsReq, hotspotsRes);
  assert.ok(Array.isArray(hotspotsRes.body.hotspots), 'Hotspot response should contain hotspot records');
  assert.ok(hotspotsRes.body.hotspots.length >= 1, 'Expected at least one hotspot aggregate');
  const hotspot = hotspotsRes.body.hotspots[0];
  assert.ok(hotspot.location, 'Hotspot should include location');
  assert.ok(hotspot.complaint_count >= 3, 'Hotspot should aggregate multiple complaints');
  assert.ok(hotspot.affected_count >= 3, 'Hotspot should aggregate affected count');
  assert.ok(hotspot.dominant_category, 'Hotspot should include dominant category');
  assert.ok(hotspot.highest_severity, 'Hotspot should include highest severity');

  const locationReq = { params: { id: complaintIds[0] } }; const locationRes = makeRes();
  await getComplaintLocation(locationReq, locationRes);
  assert.equal(locationRes.statusCode, 200, 'Complaint location should resolve successfully');
  assert.equal(locationRes.body.master_issue_id, clusterId, 'Complaint location should include the master issue ID');
  assert.ok(locationRes.body.location || locationRes.body.address, 'Complaint location should include a location or address');
  assert.ok(locationRes.body.master_issue_location || locationRes.body.location, 'Complaint location should include the master issue location context');

  console.log('GIS location validation passed.');
  console.log(JSON.stringify({
    map_count: mapRes.body.complaint_count,
    hotspot_count: hotspotsRes.body.hotspot_count,
    hotspot: hotspot,
    complaint_location: {
      complaint_id: locationRes.body.complaint_id,
      location: locationRes.body.location,
      address: locationRes.body.address,
      master_issue_id: locationRes.body.master_issue_id,
      affected_count: locationRes.body.affected_count,
    },
  }, null, 2));

  await pool.query('DELETE FROM duplicate_cluster_members WHERE cluster_id = $1', [clusterId]);
  await pool.query('DELETE FROM duplicate_clusters WHERE id = $1', [clusterId]);
  await pool.query('DELETE FROM routing_results WHERE complaint_id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM severity_scores WHERE complaint_id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM complaints WHERE id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM users WHERE id = $1', [citizenId]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}).finally(() => pool.end());
