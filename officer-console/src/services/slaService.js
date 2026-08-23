// ============================================================================
// JanSeva AI — SLA Monitoring & Escalation Service
// ============================================================================
// Derives SLA performance, pressure metrics, escalation tiers, and officer workloads
// from the authoritative municipal complaint dataset with backend REST contracts.

import { MUNICIPAL_DEPARTMENTS } from '../data/mockData';
import { officers } from '../mock/officers';
import { apiClient, isApiMode } from './apiClient';
import { getComplaints, escalateComplaint } from './api';

/**
 * Calculate Global SLA KPIs and Pressure Distribution (Deterministic Fallback)
 */
export function getSLAOverview(complaints = []) {
  const activeComplaints = complaints.filter(
    c => c.status !== 'Resolved' && c.status !== 'Citizen Confirmed' && c.status !== 'Rejected'
  );

  const totalActive = activeComplaints.length;
  const onTrackList = activeComplaints.filter(c => c.slaStatus === 'ON TRACK' || !c.slaStatus);
  const atRiskList = activeComplaints.filter(c => c.slaStatus === 'AT RISK');
  const breachedList = activeComplaints.filter(c => c.slaStatus === 'BREACHED');

  const dueWithin4HoursList = activeComplaints.filter(
    c => c.slaRemainingHours !== undefined && c.slaRemainingHours > 0 && c.slaRemainingHours <= 4
  );

  const escalatedList = activeComplaints.filter(c => (c.escalationLevel || 1) > 1);

  const onTrackPercent = totalActive > 0 ? Math.round((onTrackList.length / totalActive) * 100) : 0;
  const atRiskPercent = totalActive > 0 ? Math.round((atRiskList.length / totalActive) * 100) : 0;
  const breachedPercent = totalActive > 0 ? Math.round((breachedList.length / totalActive) * 100) : 0;

  return {
    totalActive,
    onTrackCount: onTrackList.length,
    atRiskCount: atRiskList.length,
    breachedCount: breachedList.length,
    dueWithin4HoursCount: dueWithin4HoursList.length,
    escalatedCount: escalatedList.length,
    onTrackPercent,
    atRiskPercent,
    breachedPercent,
  };
}

/**
 * Calculate SLA Metrics Grouped by Municipal Department (Deterministic Fallback)
 */
export function getDepartmentSLAStats(complaints = []) {
  const deptMap = {};

  Object.values(MUNICIPAL_DEPARTMENTS).forEach(deptName => {
    deptMap[deptName] = {
      department: deptName,
      totalActive: 0,
      onTrack: 0,
      atRisk: 0,
      breached: 0,
      criticalCount: 0,
      complianceRate: 100,
    };
  });

  const activeComplaints = complaints.filter(
    c => c.status !== 'Resolved' && c.status !== 'Citizen Confirmed' && c.status !== 'Rejected'
  );

  activeComplaints.forEach(c => {
    const dept = c.department || MUNICIPAL_DEPARTMENTS.WATER;
    if (!deptMap[dept]) {
      deptMap[dept] = {
        department: dept,
        totalActive: 0,
        onTrack: 0,
        atRisk: 0,
        breached: 0,
        criticalCount: 0,
        complianceRate: 100,
      };
    }

    const d = deptMap[dept];
    d.totalActive += 1;

    if (c.priority === 'Critical') d.criticalCount += 1;

    if (c.slaStatus === 'BREACHED') d.breached += 1;
    else if (c.slaStatus === 'AT RISK') d.atRisk += 1;
    else d.onTrack += 1;
  });

  return Object.values(deptMap).map(d => {
    const compliance = d.totalActive > 0 ? Math.round((d.onTrack / d.totalActive) * 100) : 100;
    return {
      ...d,
      complianceRate: compliance,
    };
  }).sort((a, b) => b.totalActive - a.totalActive);
}

/**
 * Calculate Officer SLA Workload & Urgency Metrics (Deterministic Fallback)
 */
export function getOfficerSLAWorkload(complaints = []) {
  const officerMap = {};

  officers.forEach(off => {
    officerMap[off.name] = {
      id: off.id,
      name: off.name,
      role: off.role,
      department: off.department,
      assignedCount: 0,
      atRiskCount: 0,
      breachedCount: 0,
      criticalCount: 0,
      escalatedCount: 0,
    };
  });

  const activeComplaints = complaints.filter(
    c => c.status !== 'Resolved' && c.status !== 'Citizen Confirmed' && c.status !== 'Rejected'
  );

  activeComplaints.forEach(c => {
    if (!c.assignedOfficer || c.assignedOfficer === 'UNASSIGNED') return;

    // Extract officer name before parentheses
    const rawName = c.assignedOfficer.split('(')[0].trim();
    const matched = Object.keys(officerMap).find(k => rawName.includes(k) || k.includes(rawName));

    if (matched) {
      const o = officerMap[matched];
      o.assignedCount += 1;
      if (c.priority === 'Critical') o.criticalCount += 1;
      if (c.slaStatus === 'AT RISK') o.atRiskCount += 1;
      if (c.slaStatus === 'BREACHED') o.breachedCount += 1;
      if ((c.escalationLevel || 1) > 1) o.escalatedCount += 1;
    }
  });

  return Object.values(officerMap).sort((a, b) => b.assignedCount - a.assignedCount);
}

/**
 * Calculate Escalation Tiers Summary (Level 1, Level 2, Level 3)
 */
export function getEscalationSummary(complaints = []) {
  const active = complaints.filter(
    c => c.status !== 'Resolved' && c.status !== 'Citizen Confirmed' && c.status !== 'Rejected'
  );

  const level1 = active.filter(c => !c.escalationLevel || c.escalationLevel === 1);
  const level2 = active.filter(c => c.escalationLevel === 2);
  const level3 = active.filter(c => c.escalationLevel === 3);

  const getAvgRemaining = list => {
    const valid = list.filter(c => c.slaRemainingHours !== undefined && c.slaRemainingHours > 0);
    if (valid.length === 0) return '0.0h';
    const sum = valid.reduce((acc, c) => acc + c.slaRemainingHours, 0);
    return `${(sum / valid.length).toFixed(1)}h`;
  };

  return {
    level1: {
      level: 1,
      title: 'Level 1: Zonal / Field Supervisor',
      count: level1.length,
      criticalCount: level1.filter(c => c.priority === 'Critical').length,
      avgRemaining: getAvgRemaining(level1),
      trigger: 'Standard initial assignment & response phase (0–70% SLA elapsed)',
    },
    level2: {
      level: 2,
      title: 'Level 2: Municipal Department Head',
      count: level2.length,
      criticalCount: level2.filter(c => c.priority === 'Critical').length,
      avgRemaining: getAvgRemaining(level2),
      trigger: 'SLA risk threshold exceeded (<4 hours) or multi-department blockage',
    },
    level3: {
      level: 3,
      title: 'Level 3: Municipal Commissioner (IAS)',
      count: level3.length,
      criticalCount: level3.filter(c => c.priority === 'Critical').length,
      avgRemaining: getAvgRemaining(level3),
      trigger: 'SLA deadline breached, major public hazard, or emergency escalation',
    },
  };
}

// ============================================================================
// Async REST Contract Methods
// ============================================================================

/**
 * Fetch Priority SLA Queue with At-Risk & Breached Records
 * Endpoint: GET /sla/queue
 */
export async function getSLAQueue(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/sla/queue', { params: filters });
      return data;
    } catch (err) {
      console.warn('[slaService] getSLAQueue backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return complaints.filter(c => c.slaStatus === 'AT RISK' || c.slaStatus === 'BREACHED');
}

/**
 * Fetch SLA Status & Countdown for a Specific Complaint
 * Endpoint: GET /sla/status/:complaintId
 */
export async function getSLAStatus(complaintId) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get(`/sla/status/${complaintId}`);
      return data;
    } catch (err) {
      console.warn(`[slaService] getSLAStatus backend call failed for ${complaintId}, using prototype:`, err.message);
    }
  }
  const complaints = await getComplaints();
  const complaint = complaints.find(c => c.complaintId === complaintId);
  return complaint
    ? {
        complaintId: complaint.complaintId,
        slaStatus: complaint.slaStatus,
        slaDeadline: complaint.slaDeadline,
        slaRemainingHours: complaint.slaRemainingHours,
        escalationLevel: complaint.escalationLevel || 1,
      }
    : null;
}

/**
 * Fetch Escalation Status & Matrix for a Specific Complaint
 * Endpoint: GET /sla/escalation/:complaintId
 */
export async function getEscalationStatus(complaintId) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get(`/sla/escalation/${complaintId}`);
      return data;
    } catch (err) {
      console.warn(`[slaService] getEscalationStatus backend call failed for ${complaintId}, using prototype:`, err.message);
    }
  }
  return getSLAStatus(complaintId);
}

/**
 * Trigger Escalation for a Complaint
 * Endpoint: POST /sla/escalate/:complaintId
 */
export async function triggerEscalation(complaintId, payload = {}) {
  return escalateComplaint(complaintId, payload);
}

/**
 * Fetch Department-Level SLA Compliance Statistics from Backend
 * Endpoint: GET /sla/departments
 */
export async function fetchDepartmentSLAStats(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/sla/departments', { params: filters });
      return data;
    } catch (err) {
      console.warn('[slaService] fetchDepartmentSLAStats backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getDepartmentSLAStats(complaints);
}

/**
 * Fetch Officer Workload & SLA Urgency from Backend
 * Endpoint: GET /sla/officers
 */
export async function fetchOfficerWorkload(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/sla/officers', { params: filters });
      return data;
    } catch (err) {
      console.warn('[slaService] fetchOfficerWorkload backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getOfficerSLAWorkload(complaints);
}
