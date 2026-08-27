const assert = require('node:assert/strict');
const express = require('express');
const http = require('http');

// Mock pool and auditLog
const state = {
  complaints: {
    'CMP-001': { id: 'CMP-001', status: 'in_progress', citizen_id: 'user-1', department_id: 'dept-1', assigned_officer_id: 'off-1' },
    'CMP-002': { id: 'CMP-002', status: 'submitted', citizen_id: 'user-1', department_id: 'dept-1', assigned_officer_id: 'off-1' },
  },
  auditLogs: [],
};

const pool = require('../db/pool');
const originalQuery = pool.query;

pool.query = async (sql, params = []) => {
  const queryStr = String(sql).toLowerCase();
  if (queryStr.includes('select id, department_id from officers where user_id = $1')) {
    return { rows: [{ id: 'off-1', department_id: 'dept-1' }] };
  }
  if (queryStr.includes('select * from complaints where id = $1')) {
    const id = params[0];
    return { rows: state.complaints[id] ? [state.complaints[id]] : [] };
  }
  if (queryStr.includes('update complaints') && queryStr.includes('status')) {
    const id = params[0];
    if (state.complaints[id]) {
      state.complaints[id].status = 'resolved';
      return { rows: [state.complaints[id]] };
    }
    return { rows: [] };
  }
  if (queryStr.includes('insert into audit_logs')) {
    state.auditLogs.push({ sql, params });
    return { rows: [{ id: 'audit-1' }] };
  }
  return { rows: [] };
};

// Set up mock auth app
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret123456';
const token = jwt.sign({ id: 'officer-1', role: 'officer', email: 'officer@janseva.gov.in' }, process.env.JWT_SECRET);

const complaintRoutes = require('../routes/complaintRoutes');
const app = express();
app.use(express.json());
app.use('/api/complaints', complaintRoutes);

async function runTests() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/complaints`;

  console.log('--- Running Resolution Route Validation Tests ---');

  // Test 1: Missing statutory_confirmation -> Expect 400 "Statutory officer confirmation is required"
  {
    const res = await fetch(`${baseUrl}/CMP-001/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        summary: 'Fixed water line',
        actions_taken: 'Replaced pipe valve',
        // statutory_confirmation is missing
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 400, 'Should return 400 when statutory confirmation is missing');
    assert.equal(data.error, 'Statutory officer confirmation is required');
    console.log('✓ Test 1 Passed: Missing statutory confirmation is rejected with 400');
  }

  // Test 2: statutory_confirmation: false -> Expect 400 "Statutory officer confirmation is required"
  {
    const res = await fetch(`${baseUrl}/CMP-001/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        summary: 'Fixed water line',
        actions_taken: 'Replaced pipe valve',
        statutory_confirmation: false,
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 400, 'Should return 400 when statutory confirmation is false');
    assert.equal(data.error, 'Statutory officer confirmation is required');
    console.log('✓ Test 2 Passed: False statutory confirmation is rejected with 400');
  }

  // Test 3: Missing summary -> Expect 400 "Resolution summary is required"
  {
    const res = await fetch(`${baseUrl}/CMP-001/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        statutory_confirmation: true,
        actions_taken: 'Replaced pipe valve',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 400, 'Should return 400 when summary is missing');
    assert.equal(data.error, 'Resolution summary is required');
    console.log('✓ Test 3 Passed: Missing summary is rejected with 400');
  }

  // Test 4: Complaint not in_progress -> Expect 400 "Complaint must be in_progress..."
  {
    const res = await fetch(`${baseUrl}/CMP-002/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        summary: 'Fixed water line',
        statutory_confirmation: true,
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 400, 'Should return 400 when complaint not in_progress');
    assert.ok(data.error.includes('must be in_progress'));
    console.log('✓ Test 4 Passed: Non-in_progress complaint cannot be resolved');
  }

  // Test 5: Valid payload with statutory_confirmation: true -> Expect 200 and status resolved
  {
    state.complaints['CMP-001'].status = 'in_progress';
    const res = await fetch(`${baseUrl}/CMP-001/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resolution_scope: 'Permanent Engineering Resolution',
        summary: 'Main 600mm distribution feeder valve replaced',
        technical_actions: 'Excavated chamber and installed ductile iron collar',
        rectified_area_coverage: 'Hadapsar Sector 4',
        statutory_confirmation: true,
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 200, 'Should return 200 on valid resolution');
    assert.equal(data.success, true);
    assert.equal(data.complaint.status, 'resolved');
    assert.equal(state.complaints['CMP-001'].status, 'resolved');
    console.log('✓ Test 5 Passed: Valid resolution request succeeded and status updated to resolved');
  }

  // Test 6: Valid payload with camelCase statutoryConfirmation: true -> Expect 200
  {
    state.complaints['CMP-001'].status = 'in_progress';
    const res = await fetch(`${baseUrl}/CMP-001/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resolutionScope: 'Permanent Engineering Resolution',
        resolutionSummary: 'Main 600mm distribution feeder valve replaced',
        technicalActions: 'Excavated chamber and installed ductile iron collar',
        rectifiedAreaCoverage: 'Hadapsar Sector 4',
        statutoryConfirmation: true,
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 200, 'Should return 200 on valid resolution with camelCase fields');
    assert.equal(data.success, true);
    console.log('✓ Test 6 Passed: CamelCase fields accepted and resolved successfully');
  }

  // Test 7: Frontend api.js simulation payload
  {
    state.complaints['CMP-001'].status = 'in_progress';
    // Exact payload generated by ResolutionPanel + api.js
    const frontendPayload = {
      resolution_scope: 'Permanent Resolution',
      resolution_type: 'Permanent Resolution',
      resolution_summary: 'Valve repaired and pressure restored',
      summary: 'Valve repaired and pressure restored',
      technical_actions: 'Replaced 200mm gate valve',
      actions_taken: 'Replaced 200mm gate valve',
      rectified_area_coverage: 'Zone 3',
      affected_area: 'Zone 3',
      statutory_confirmation: true,
      statutoryConfirmation: true,
      citizen_notified: true,
      officer_name: 'Rohan Patil',
      officer_role: 'Municipal Officer',
    };

    const res = await fetch(`${baseUrl}/CMP-001/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(frontendPayload),
    });
    const data = await res.json();
    assert.equal(res.status, 200, 'Frontend payload must be accepted with 200 OK');
    assert.equal(data.success, true);
    assert.equal(data.complaint.status, 'resolved');
    console.log('✓ Test 7 Passed: Exact Officer Console frontend payload accepted with 200 OK');
  }

  server.close();
  console.log('\nALL 7 VALIDATION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('Validation test failed:', err);
  process.exit(1);
});
