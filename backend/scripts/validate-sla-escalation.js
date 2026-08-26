const assert = require('node:assert/strict');
const pool = require('../db/pool');
const sla = require('../services/slaEscalation');

const state = {
  complaints: {
    low: { status: 'in_progress' },
    high: { status: 'in_progress' },
  },
  sla: {},
  severity: {
    low: { id: 'severity-low', priority_label: 'LOW' },
    high: { id: 'severity-high', priority_label: 'HIGH' },
  },
  escalations: [],
};

pool.query = async (sql, params = []) => {
  const text = String(sql).toLowerCase();

  if (text.includes('insert into audit_logs')) {
    return { rows: [] };
  }

  if (text.includes('select * from sla_tracking where complaint_id = $1')) {
    const complaintId = params[0];
    return { rows: state.sla[complaintId] ? [state.sla[complaintId]] : [] };
  }

  if (text.includes('insert into sla_tracking')) {
    const complaintId = params[0];
    const row = {
      complaint_id: complaintId,
      priority_label: params[1],
      status: params[2],
      deadline: params[3],
      started_at: params[4],
      resolved_at: params[5],
      is_breached: params[6],
      escalated_at: params[7],
      current_escalation_level: params[8],
      escalation_reason: params[9],
    };
    state.sla[complaintId] = row;
    return { rows: [row] };
  }

  if (text.includes('update sla_tracking')) {
    const complaintId = params[0];
    const row = state.sla[complaintId] || { complaint_id: complaintId };

    if (text.includes('set status =')) {
      row.status = 'BREACHED';
      row.is_breached = true;
      row.escalated_at = new Date().toISOString();
      row.current_escalation_level = params[1] || row.current_escalation_level;
      row.escalation_reason = params[2] || row.escalation_reason;
      state.sla[complaintId] = row;
      return { rows: [row] };
    }

    row.priority_label = params[1];
    row.status = params[2];
    row.deadline = params[3];
    row.started_at = params[4] || row.started_at;
    row.resolved_at = params[5];
    row.is_breached = params[6] ?? row.is_breached ?? false;
    row.escalated_at = params[7] || row.escalated_at;
    row.current_escalation_level = params[8] || row.current_escalation_level;
    row.escalation_reason = params[9] || row.escalation_reason;
    state.sla[complaintId] = row;
    return { rows: [row] };
  }

  if (text.includes('insert into sla_escalations')) {
    const complaintId = params[0];
    const escalation = {
      complaint_id: complaintId,
      escalation_level: params[1],
      reason: params[2],
      escalated_at: new Date().toISOString(),
    };
    state.escalations.push(escalation);
    return { rows: [escalation] };
  }

  if (text.includes('update severity_scores set priority_label = $1 where id = $2')) {
    const severityId = params[1];
    const nextPriority = params[0];
    const target = Object.values(state.severity).find((row) => row.id === severityId);
    if (target) target.priority_label = nextPriority;
    return { rows: [] };
  }

  if (text.includes('select st.*, (')) {
    const complaintId = params[0];
    const row = state.sla[complaintId];
    return { rows: row ? [{ ...row, escalations: state.escalations.filter((e) => e.complaint_id === complaintId) }] : [] };
  }

  if (text.includes('from sla_tracking s')) {
    return { rows: Object.entries(state.sla)
      .filter(([complaintId]) => state.complaints[complaintId] && state.complaints[complaintId].status !== 'resolved' && state.complaints[complaintId].status !== 'closed')
      .filter(([complaintId]) => new Date(state.sla[complaintId].deadline) < new Date())
      .map(([complaintId, row]) => ({
        complaint_id: complaintId,
        deadline: row.deadline,
        status: row.status,
        current_escalation_level: row.current_escalation_level,
        priority_label: row.priority_label,
        complaint_status: state.complaints[complaintId].status,
        effective_priority: row.priority_label || 'LOW',
        severity_id: state.severity[complaintId]?.id || null,
      })) };
  }

  if (text.includes('from complaints c')) {
    const complaintId = params[0];
    return { rows: [{ id: complaintId, status: state.complaints[complaintId]?.status || 'in_progress' }] };
  }

  return { rows: [] };
};

(async () => {
  const lowSla = await sla.ensureSlaTrackingForComplaint('low', 'LOW');
  assert.equal(lowSla.status, 'ACTIVE');
  assert.ok(new Date(lowSla.deadline).getTime() > Date.now());

  const highSla = await sla.ensureSlaTrackingForComplaint('high', 'HIGH');
  assert.equal(highSla.priority_label, 'HIGH');
  assert.ok(new Date(highSla.deadline).getTime() < new Date(lowSla.deadline).getTime());

  const lowStatus = await sla.getComplaintSlaStatus('low');
  assert.equal(lowStatus.status, 'ACTIVE');
  assert.equal(lowStatus.priority_label, 'LOW');

  state.sla.high.deadline = new Date(Date.now() - 60 * 1000).toISOString();
  state.complaints.high.status = 'in_progress';
  const escalated = await sla.runEscalationSweep();
  assert.equal(escalated.length, 1, 'One complaint should breach and escalate');
  assert.equal(state.sla.high.status, 'BREACHED');
  assert.equal(state.sla.high.current_escalation_level, 'Ward Officer');

  state.sla.high.deadline = new Date(Date.now() - 60 * 1000).toISOString();
  state.sla.high.current_escalation_level = 'Ward Officer';
  state.sla.high.status = 'BREACHED';
  const escalatedAgain = await sla.runEscalationSweep();
  assert.equal(escalatedAgain.length, 1, 'Second breach should escalate again');
  assert.equal(state.sla.high.current_escalation_level, 'Department/Subdivision Head');
  assert.ok(state.escalations.length >= 2, 'Escalation history must be recorded');

  const status = await sla.getComplaintSlaStatus('high');
  assert.equal(status.is_breached, true);
  assert.equal(status.current_escalation_level, 'Department/Subdivision Head');

  console.log('SLA escalation validation passed.');
  console.log(JSON.stringify({
    low_deadline: lowSla.deadline,
    high_deadline: highSla.deadline,
    high_status: status.status,
    current_escalation_level: status.current_escalation_level,
    escalations: status.escalations.length,
  }, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
