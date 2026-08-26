const assert = require('node:assert/strict');
const { Pool } = require('pg');
const { refreshMasterIssueCluster } = require('../controllers/pipelineController');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureMasterIssueColumns() {
  await pool.query(`
    ALTER TABLE duplicate_clusters
      ADD COLUMN IF NOT EXISTS category VARCHAR(100),
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS severity VARCHAR(20),
      ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'open',
      ADD COLUMN IF NOT EXISTS affected_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'LOW',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
  `);
}

async function insertUniqueUser(email, name) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return existing.rows[0].id;
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role, is_verified)
     VALUES ($1, $2, $3, $4, 'citizen', true)
     RETURNING id`,
    [name, email, '9999999999', 'placeholder-hash']
  );
  return result.rows[0].id;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  await ensureMasterIssueColumns();

  const citizenId = await insertUniqueUser('cluster-test-citizen@example.com', 'Cluster Test Citizen');
  const waterDepartment = await pool.query(`SELECT id FROM departments WHERE name = 'Water Supply' LIMIT 1`);
  if (!waterDepartment.rows.length) {
    throw new Error('Water Supply department is missing');
  }

  const complaintIds = [];
  const complaints = [
    { title: 'No water supply in Ward 12 for three days', description: 'Water not available in ward 12, pipeline issue and no drinking water for days' },
    { title: 'Water unavailable in Ward 12', description: 'No drinking water supply in our area, the main pipeline is leaking and residents are affected' },
    { title: 'Ward 12 water outage', description: 'Tap water is off for days and people in the neighbourhood have no drinking water' },
  ];

  for (const complaint of complaints) {
    const result = await pool.query(
      `INSERT INTO complaints (citizen_id, department_id, title, description, status, latitude, longitude)
       VALUES ($1, $2, $3, $4, 'submitted', 12.9716, 77.5946)
       RETURNING id`,
      [citizenId, waterDepartment.rows[0].id, complaint.title, complaint.description]
    );
    complaintIds.push(result.rows[0].id);
  }

  const cluster = await pool.query(
    `INSERT INTO duplicate_clusters (representative_complaint_id, category, location, severity, status, affected_count, priority)
     VALUES ($1, 'No water supply', 'Multiple locations', 'HIGH', 'open', 0, 'HIGH')
     RETURNING *`,
    [complaintIds[0]]
  );

  for (const complaintId of complaintIds) {
    await pool.query(
      `INSERT INTO duplicate_cluster_members (cluster_id, complaint_id, similarity_score)
       VALUES ($1, $2, 0.92)
       ON CONFLICT (cluster_id, complaint_id) DO UPDATE SET similarity_score = EXCLUDED.similarity_score`,
      [cluster.rows[0].id, complaintId]
    );
  }

  const updated = await refreshMasterIssueCluster(cluster.rows[0].id);
  assert.equal(updated.affected_count, 3, `Expected 3 affected complaints, got ${updated.affected_count}`);
  assert.equal(updated.category, 'No water supply', `Expected category to be 'No water supply', got ${updated.category}`);
  assert.equal(updated.status, 'open', `Expected cluster to remain open, got ${updated.status}`);
  assert.ok(['HIGH', 'CRITICAL'].includes(updated.priority), `Expected elevated priority, got ${updated.priority}`);

  const complaintCount = await pool.query('SELECT COUNT(*)::int AS count FROM complaints WHERE id = ANY($1::uuid[])', [complaintIds]);
  assert.equal(complaintCount.rows[0].count, 3, 'Individual complaints must remain in the system after clustering');

  console.log('Master issue clustering validation passed.');
  console.log(JSON.stringify({ cluster_id: updated.id, affected_count: updated.affected_count, category: updated.category, priority: updated.priority, status: updated.status }, null, 2));

  await pool.query('DELETE FROM duplicate_cluster_members WHERE cluster_id = $1', [cluster.rows[0].id]);
  await pool.query('DELETE FROM duplicate_clusters WHERE id = $1', [cluster.rows[0].id]);
  await pool.query('DELETE FROM complaints WHERE id = ANY($1::uuid[])', [complaintIds]);
  await pool.query('DELETE FROM users WHERE id = $1', [citizenId]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
