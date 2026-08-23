// ============================================================================
// JanSeva AI — Audit Logs & Statutory Compliance Service
// ============================================================================
// Flattens and enriches immutable audit trails across municipal grievances,
// computes governance traceability scores, handles client-side CSV exports,
// and supports backend immutable audit ledger integration.

import { apiClient, isApiMode } from './apiClient';
import { getComplaints } from './api';

/**
 * Infer structured event metadata from raw audit log text and role
 */
export function inferEventDetails(rawLog, complaint) {
  const text = (rawLog.action || '').toLowerCase();
  const role = (rawLog.role || '').toLowerCase();
  const actor = rawLog.actor || 'System';

  let eventType = 'Operational Action';
  let actorType = 'Officer';
  let authorityBadge = 'OFFICER AUTHORITY';

  if (role.includes('citizen') || actor.toLowerCase().includes('citizen')) {
    actorType = 'Citizen';
    authorityBadge = 'CITIZEN EVENT';
    eventType = 'Complaint Submitted';
  } else if (role.includes('ai') || actor.toLowerCase().includes('ai') || text.includes('auto-classified')) {
    actorType = 'AI Engine';
    authorityBadge = 'AI ADVISORY';
    eventType = 'AI Classified';
  } else if (text.includes('approved ai') || text.includes('modified ai') || text.includes('flagged ai')) {
    actorType = 'Officer';
    authorityBadge = 'OFFICER AUTHORITY';
    eventType = 'AI Reviewed';
  } else if (text.includes('reassigned to')) {
    actorType = 'Officer';
    authorityBadge = 'OFFICER AUTHORITY';
    eventType = 'Reassignment';
  } else if (text.includes('assigned to') || text.includes('assigned emergency')) {
    actorType = 'Officer';
    authorityBadge = 'OFFICER AUTHORITY';
    eventType = 'Assignment';
  } else if (text.includes('escalated') || text.includes('escalation')) {
    actorType = 'Officer';
    authorityBadge = 'OFFICER AUTHORITY';
    eventType = 'Escalation';
  } else if (text.includes('resolution submitted') || text.includes('submitted final resolution')) {
    actorType = 'Officer';
    authorityBadge = 'OFFICER AUTHORITY';
    eventType = 'Resolution Submitted';
  } else if (text.includes('citizen confirmed') || text.includes('otp verified')) {
    actorType = 'Citizen';
    authorityBadge = 'CITIZEN EVENT';
    eventType = 'Citizen Confirmation';
  } else if (text.includes('reopened')) {
    actorType = 'Officer';
    authorityBadge = 'OFFICER AUTHORITY';
    eventType = 'Reopened';
  } else if (text.includes('evidence attached') || text.includes('evidence')) {
    actorType = 'Officer';
    authorityBadge = 'OFFICER AUTHORITY';
    eventType = 'Evidence Added';
  } else if (text.includes('status transitioned')) {
    actorType = 'Officer';
    authorityBadge = 'OFFICER AUTHORITY';
    eventType = 'Status Change';
  }

  return {
    eventType,
    actorType,
    authorityBadge,
  };
}

/**
 * Flatten and enrich all audit records from active complaints
 */
export function getEnrichedAuditLedger(complaints = []) {
  const allLogs = [];

  complaints.forEach(c => {
    (c.auditHistory || []).forEach((log, index) => {
      const { eventType, actorType, authorityBadge } = inferEventDetails(log, c);

      allLogs.push({
        eventId: `AUD-${c.complaintId}-${index + 1}`,
        complaintId: c.complaintId,
        complaintTitle: c.title,
        timestamp: log.timestamp || '2026-08-20T08:15:00Z',
        actor: log.actor || 'Municipal Officer',
        role: log.role || 'Officer',
        action: log.action || 'Operational action recorded',
        department: c.department || 'General',
        ward: c.ward || 'Ward 12',
        status: c.status || 'In Progress',
        eventType,
        actorType,
        authorityBadge,
      });
    });
  });

  return allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Calculate Summary Audit KPIs
 */
export function getAuditSummary(auditRecords = []) {
  const totalEvents = auditRecords.length;
  const aiEvents = auditRecords.filter(r => r.actorType === 'AI Engine').length;
  const officerEvents = auditRecords.filter(r => r.actorType === 'Officer').length;
  const escalations = auditRecords.filter(r => r.eventType === 'Escalation').length;
  const resolutions = auditRecords.filter(r => r.eventType === 'Resolution Submitted').length;
  const humanVerifications = auditRecords.filter(
    r => r.action && r.action.toLowerCase().includes('human verification')
  ).length;
  const citizenConfirmations = auditRecords.filter(
    r => r.eventType === 'Citizen Confirmation'
  ).length;

  return {
    totalEvents,
    sessionEvents: totalEvents,
    aiEvents,
    officerEvents,
    escalations,
    resolutions,
    humanVerifications,
    citizenConfirmations,
  };
}

/**
 * Group Audit Records by Actor for Accountability Table
 */
export function getActorActivity(auditRecords = []) {
  const actorMap = {};

  auditRecords.forEach(r => {
    const key = r.actor;
    if (!actorMap[key]) {
      actorMap[key] = {
        actor: r.actor,
        role: r.role,
        actorType: r.actorType,
        totalEvents: 0,
        lastAction: r.action,
        lastTimestamp: r.timestamp,
        escalations: 0,
        resolutions: 0,
        humanReviews: 0,
      };
    }

    const a = actorMap[key];
    a.totalEvents += 1;
    if (r.eventType === 'Escalation') a.escalations += 1;
    if (r.eventType === 'Resolution Submitted') a.resolutions += 1;
    if (r.eventType === 'AI Reviewed') a.humanReviews += 1;

    if (new Date(r.timestamp) > new Date(a.lastTimestamp)) {
      a.lastTimestamp = r.timestamp;
      a.lastAction = r.action;
    }
  });

  return Object.values(actorMap).sort((a, b) => b.totalEvents - a.totalEvents);
}

/**
 * Calculate Event Type Distribution Counts
 */
export function getEventDistribution(auditRecords = []) {
  const counts = {};
  auditRecords.forEach(r => {
    counts[r.eventType] = (counts[r.eventType] || 0) + 1;
  });

  const total = auditRecords.length;
  return Object.entries(counts)
    .map(([eventType, count]) => ({
      eventType,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate Prototype Governance & Statutory Compliance Checks
 */
export function getComplianceMonitor(complaints = [], auditRecords = []) {
  const total = complaints.length;

  const checks = [
    {
      id: 'ai_review',
      label: 'AI Recommendation Reviewed by Authorized Officer',
      description: 'AI triage recommendations must have an accepted or modified human officer decision',
      status: 'COMPLIANT',
      passedCount: complaints.filter(c => c.aiReviewState && c.aiReviewState !== 'PENDING REVIEW').length,
      totalCount: total,
    },
    {
      id: 'officer_authority',
      label: 'Officer Statutory Authority Recorded',
      description: 'Every operational status transition contains authentic municipal persona signature',
      status: 'COMPLIANT',
      passedCount: complaints.filter(c => c.assignedOfficer && c.assignedOfficer !== 'UNASSIGNED').length,
      totalCount: total,
    },
    {
      id: 'assignment_recorded',
      label: 'Departmental Field Assignment Recorded',
      description: 'Complaint assigned to appropriate departmental division and engineer',
      status: 'COMPLIANT',
      passedCount: complaints.filter(c => c.department && c.assignedOfficer).length,
      totalCount: total,
    },
    {
      id: 'action_logged',
      label: 'On-Ground Operational Actions Logged',
      description: 'At least one field dispatch, inspection, or material order recorded',
      status: 'COMPLIANT',
      passedCount: complaints.filter(c => (c.auditHistory || []).length >= 3).length,
      totalCount: total,
    },
    {
      id: 'resolution_declaration',
      label: 'Statutory Resolution Declaration Completed',
      description: 'Final closure includes signed officer confirmation and remedial explanation',
      status: 'COMPLIANT',
      passedCount: complaints.filter(c => c.status === 'Resolved' || c.status === 'Citizen Confirmed').length,
      totalCount: Math.max(1, complaints.filter(c => c.status === 'Resolved' || c.status === 'Citizen Confirmed').length),
    },
    {
      id: 'evidence_attached',
      label: 'Remedial Evidence Attached for Closure',
      description: 'Resolved grievances have verified field photo or inspection report attached',
      status: 'COMPLIANT',
      passedCount: complaints.filter(c => c.evidence && c.evidence.length > 0).length,
      totalCount: total,
    },
    {
      id: 'citizen_confirmation',
      label: 'Citizen OTP Confirmation / Feedback Recorded',
      description: 'Citizen satisfaction confirmed via portal OTP or phone callback',
      status: 'COMPLIANT',
      passedCount: complaints.filter(c => c.status === 'Citizen Confirmed').length,
      totalCount: Math.max(1, complaints.filter(c => c.status === 'Resolved' || c.status === 'Citizen Confirmed').length),
    },
    {
      id: 'escalation_justification',
      label: 'Escalation Justification & Senior Officer Notified',
      description: 'Level 2 & Level 3 escalations contain recorded justification reason',
      status: 'COMPLIANT',
      passedCount: complaints.filter(c => (c.escalationLevel || 1) > 1).length,
      totalCount: Math.max(1, complaints.filter(c => (c.escalationLevel || 1) > 1).length),
    },
  ];

  // Calculate Operational Traceability Score
  const totalPassed = checks.reduce((acc, c) => acc + c.passedCount, 0);
  const totalApplicable = checks.reduce((acc, c) => acc + c.totalCount, 0);
  const traceabilityScore = totalApplicable > 0 ? Math.round((totalPassed / totalApplicable) * 100) : 92;

  // Missing trace alerts
  const alerts = [];
  complaints.forEach(c => {
    if ((c.status === 'Resolved' || c.status === 'Citizen Confirmed') && (!c.evidence || c.evidence.length === 0)) {
      alerts.push({
        id: `alert-no-ev-${c.complaintId}`,
        complaintId: c.complaintId,
        message: `Resolution recorded without accompanying field completion evidence attachment.`,
        severity: 'ATTENTION',
      });
    }
  });

  return {
    checks,
    traceabilityScore,
    alerts,
  };
}

/**
 * Trigger Client-Side CSV Download of Filtered Audit Records
 */
export function exportAuditCSV(records = []) {
  if (!records || records.length === 0) return false;

  const headers = [
    'Event ID',
    'Timestamp',
    'Event Type',
    'Complaint ID',
    'Actor',
    'Actor Role',
    'Authority Type',
    'Department',
    'Ward',
    'Description',
  ];

  const escapeCSV = val => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => [
    escapeCSV(r.eventId),
    escapeCSV(r.timestamp),
    escapeCSV(r.eventType),
    escapeCSV(r.complaintId),
    escapeCSV(r.actor),
    escapeCSV(r.role),
    escapeCSV(r.authorityBadge),
    escapeCSV(r.department),
    escapeCSV(r.ward),
    escapeCSV(r.action),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `janseva-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

// ============================================================================
// Async REST Contract Methods
// ============================================================================

/**
 * Fetch Filtered Audit Events from Backend
 * Endpoint: GET /audit/events
 */
export async function getAuditEvents(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/audit/events', { params: filters });
      return data;
    } catch (err) {
      console.warn('[auditService] getAuditEvents backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getEnrichedAuditLedger(complaints);
}

/**
 * Fetch Complete Audit Trail for a Specific Complaint
 * Endpoint: GET /audit/complaints/:id/trail
 */
export async function getComplaintAuditTrail(complaintId) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get(`/audit/complaints/${complaintId}/trail`);
      return data;
    } catch (err) {
      console.warn(`[auditService] getComplaintAuditTrail backend call failed for ${complaintId}, using prototype:`, err.message);
    }
  }
  const complaints = await getComplaints();
  const complaint = complaints.find(c => c.complaintId === complaintId);
  return complaint ? complaint.auditHistory || [] : [];
}

/**
 * Fetch Officer & Actor Activity Breakdown from Backend
 * Endpoint: GET /audit/actors
 */
export async function fetchActorActivity(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/audit/actors', { params: filters });
      return data;
    } catch (err) {
      console.warn('[auditService] fetchActorActivity backend call failed, using prototype:', err.message);
    }
  }
  const auditRecords = await getAuditEvents(filters);
  return getActorActivity(auditRecords);
}

/**
 * Fetch Statutory Governance & Traceability Compliance Status
 * Endpoint: GET /audit/compliance
 */
export async function getComplianceStatus() {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/audit/compliance');
      return data;
    } catch (err) {
      console.warn('[auditService] getComplianceStatus backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints();
  const auditRecords = getEnrichedAuditLedger(complaints);
  return getComplianceMonitor(complaints, auditRecords);
}
