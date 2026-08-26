const assert = require('node:assert/strict');
require('dotenv').config();

const pool = require('../db/pool');
const departmentId = '11111111-1111-1111-1111-111111111111';
const officerId = '22222222-2222-2222-2222-222222222222';

pool.query = async (sql, params = []) => {
  const text = String(sql).toLowerCase();

  if (text.includes('from departments') && text.includes('where lower(name)')) {
    return { rows: [{ id: departmentId, name: 'Water Supply' }] };
  }
  if (text.includes('from officers') && text.includes('where o.department_id = $1')) {
    return { rows: [{ id: officerId, designation: 'Water Works Inspector', user_name: 'Routing Test Officer' }] };
  }
  if (text.includes('from officers o') && text.includes('left join users')) {
    return { rows: [{ id: officerId, designation: 'Water Works Inspector', user_name: 'Routing Test Officer' }] };
  }
  if (text.includes('select o.id, count') && text.includes('where o.department_id = $1')) {
    return { rows: [{ id: officerId, open_count: 2 }] };
  }
  return { rows: [] };
};

const { validateRoutingRecommendation } = require('../services/aiEngine');

async function main() {
  const aiRecommendation = {
    department: 'Water Supply',
    ward_or_subdivision: 'Ward 12',
    recommended_officer: 'Water Works Inspector',
    confidence: 0.91,
    reason: 'Repeated water outage in Ward 12 affecting households and essential service continuity.',
  };

  const validated = await validateRoutingRecommendation(aiRecommendation, {
    department_id: departmentId,
    ward: 'Ward 12',
  });

  assert.equal(validated.department_id, departmentId, 'Department must validate to Water Supply');
  assert.equal(validated.officer_id, officerId, 'Officer must validate against the same department');
  assert.equal(validated.ward, 'Ward 12', 'Ward should be persisted as Ward 12');
  assert.ok(validated.confidence >= 0.9, `Expected high confidence, got ${validated.confidence}`);

  const persistedRoute = {
    complaint_id: '33333333-3333-3333-3333-333333333333',
    routed_department_id: validated.department_id,
    routed_officer_id: validated.officer_id,
    ward: validated.ward,
    subdivision: validated.subdivision,
    confidence: validated.confidence,
    reason: validated.reason,
  };

  assert.equal(persistedRoute.ward, 'Ward 12');
  assert.equal(persistedRoute.confidence, 0.91);
  assert.equal(persistedRoute.routed_department_id, departmentId);
  assert.equal(persistedRoute.routed_officer_id, officerId);

  console.log('Routing validation passed.');
  console.log(JSON.stringify({
    complaint_id: persistedRoute.complaint_id,
    department: 'Water Supply',
    officer_id: persistedRoute.routed_officer_id,
    ward: persistedRoute.ward,
    subdivision: persistedRoute.subdivision,
    confidence: persistedRoute.confidence,
    reason: persistedRoute.reason,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
