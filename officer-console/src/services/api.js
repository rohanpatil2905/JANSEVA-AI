// ============================================================================
// JanSeva AI — Unified Service Abstraction Layer & Data Adapter
// ============================================================================
// ALL data access and lifecycle transitions from UI components route through this layer.
// Supports dual-mode execution via adapter strategy:
//   1. Mock/Prototype Mode: sessionStorage-backed municipal dataset (20 authoritative records)
//   2. API Mode: Centralized backend HTTP transport via apiClient with automatic normalization
//
// If the backend is unavailable or unconfigured, the service transparently and safely
// falls back to the authoritative prototype municipal dataset.

import {
  complaintsData,
  mockDashboardStats,
  mockHotspots,
  MUNICIPAL_CATEGORIES,
  MUNICIPAL_DEPARTMENTS,
  MUNICIPAL_WARDS,
} from '../data/mockData.js';

import { apiClient, isApiMode } from './apiClient.js';
import {
  normalizeComplaint,
  normalizeComplaintsList,
  normalizeAIRecommendation,
  denormalizeQueryParams,
} from './normalizers.js';

const STORAGE_KEY = 'janseva_ai_complaints_v1';
const SIMULATED_LATENCY_MS = 140;
const delay = (ms = SIMULATED_LATENCY_MS) => new Promise(resolve => setTimeout(resolve, ms));
const unwrapComplaint = data => data?.complaint || data;

// ============================================================================
// Prototype In-Memory & SessionStorage Working State Engine
// ============================================================================
function loadWorkingState() {
  try {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
  } catch (e) {
    console.warn('Session storage read failed, using in-memory state', e);
  }
  return [...complaintsData];
}

function saveWorkingState(data) {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Session storage save failed', e);
  }
  workingComplaints = data;
}

let workingComplaints = loadWorkingState();

// ============================================================================
// Service Methods (Adapter Dispatched)
// ============================================================================

/**
 * Fetch Macro Operational Dashboard KPI Statistics
 * Endpoint: GET /analytics/officer-analytics
 */
export async function getDashboardStats() {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/officer-analytics');
      return {
        totalComplaints: data.total_complaints ?? 0,
        openComplaints: data.pending_complaints ?? 0,
        criticalComplaints: data.critical_high_complaints ?? 0,
        criticalRequiringReview: 0,
        slaAtRisk: data.sla_breached ?? 0,
        slaBreached: data.sla_breached ?? 0,
        slaDueWithin4Hours: 0,
        resolvedToday: data.resolved_today ?? 0,
        todayNewSubmissions: data.today_new_submissions ?? 0,
        categoryBreakdown: (data.category_counts || []).map(item => ({
          category: item.category || 'Uncategorized',
          count: Number(item.complaint_count) || 0,
        })),
      };
    } catch (err) {
      console.warn('[api] getDashboardStats backend call failed, using prototype fallback:', err.message);
    }
  }

  await delay();
  return { ...mockDashboardStats };
}

/**
 * Fetch Complaints with Optional Filters & Sorting
 * Endpoint: GET /complaints
 */
export async function getComplaints(params = {}) {
  if (isApiMode()) {
    try {
      const queryParams = denormalizeQueryParams(params);
      const data = await apiClient.get('/complaints', { params: queryParams });
      const rawList = Array.isArray(data) ? data : data?.complaints || data?.items || [];
      return normalizeComplaintsList(rawList);
    } catch (err) {
      console.warn('[api] getComplaints backend call failed, using prototype fallback:', err.message);
    }
  }

  await delay();
  let list = [...workingComplaints];

  const { search, category, ward, priority, status, slaStatus, limit } = params;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      c =>
        c.complaintId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.ward.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        (c.assignedOfficer && c.assignedOfficer.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'All') {
    list = list.filter(c => c.category === category);
  }

  if (ward && ward !== 'All') {
    list = list.filter(c => c.ward === ward);
  }

  if (priority && priority !== 'All') {
    list = list.filter(c => c.priority === priority);
  }

  if (status && status !== 'All') {
    list = list.filter(c => c.status === status);
  }

  if (slaStatus && slaStatus !== 'All') {
    list = list.filter(c => c.slaStatus === slaStatus);
  }

  if (limit) {
    list = list.slice(0, limit);
  }

  return list;
}

/**
 * Fetch Single Complaint by Unique ID
 * Endpoint: GET /complaints/:id
 */
export async function getComplaintById(complaintId) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get(`/complaints/${complaintId}`);
      return normalizeComplaint(unwrapComplaint(data));
    } catch (err) {
      console.warn(`[api] getComplaintById backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay();
  const complaint = workingComplaints.find(c => c.complaintId === complaintId);
  if (!complaint) {
    throw new Error(`Complaint with ID ${complaintId} not found.`);
  }
  return { ...complaint };
}

/**
 * Fetch Explainable AI (XAI) Analysis for a Complaint
 * Endpoint: GET /ai/recommendations/:complaintId
 */
export async function getAIAnalysis(complaintId) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get(`/ai/recommendations/${complaintId}`);
      return normalizeAIRecommendation(data);
    } catch (err) {
      console.warn(`[api] getAIAnalysis backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay();
  const complaint = workingComplaints.find(c => c.complaintId === complaintId);
  if (!complaint) {
    throw new Error(`Complaint with ID ${complaintId} not found.`);
  }
  return {
    complaintId: complaint.complaintId,
    aiSummary: complaint.aiSummary,
    predictedCategory: complaint.predictedCategory,
    recommendedDepartment: complaint.recommendedDepartment,
    routingConfidence: complaint.routingConfidence,
    severityScore: complaint.severityScore,
    priority: complaint.priority,
    aiConfidence: complaint.aiConfidence,
    xaiFactors: complaint.xaiFactors,
    routingReasons: complaint.routingReasons,
    authenticityReasons: complaint.authenticityReasons,
    severityFactors: complaint.severityFactors,
    authenticityScore: complaint.authenticityScore,
    authenticityStatus: complaint.authenticityStatus,
    duplicateCount: complaint.duplicateCount,
    masterIssueId: complaint.masterIssueId,
  };
}

/**
 * Submit Human-in-the-Loop Officer Decision (Approval or Modification)
 * Endpoint: POST /complaints/:id/officer-decision
 */
export async function submitOfficerDecision(complaintId, decisionData) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/complaints/${complaintId}/officer-decision`, {
        category: decisionData.category,
        severity_score: decisionData.severityScore,
        department: decisionData.department,
        assigned_officer: decisionData.assignedOfficer,
        officer_name: decisionData.officerName,
        officer_role: decisionData.officerRole,
        reason: decisionData.reason,
      });
      return normalizeComplaint(data);
    } catch (err) {
      console.warn(`[api] submitOfficerDecision backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(120);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) {
    throw new Error(`Complaint with ID ${complaintId} not found.`);
  }

  const prev = workingComplaints[index];
  const isOverride =
    decisionData.category !== prev.predictedCategory ||
    decisionData.severityScore !== prev.severityScore ||
    decisionData.department !== prev.recommendedDepartment;

  const nextStatus = prev.status === 'Submitted' || prev.status === 'AI Classified' ? 'Assigned' : prev.status;

  const updated = {
    ...prev,
    aiReviewState: isOverride ? 'MODIFIED' : 'APPROVED',
    category: decisionData.category || prev.category,
    severityScore: decisionData.severityScore !== undefined ? decisionData.severityScore : prev.severityScore,
    department: decisionData.department || prev.department,
    status: nextStatus,
    assignedOfficer: decisionData.assignedOfficer || prev.assignedOfficer,
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: decisionData.officerName || 'Officer',
        role: decisionData.officerRole || 'Municipal Officer',
        action: isOverride
          ? `Officer Modified AI Recommendation: ${decisionData.reason || 'Field assessment adjustment'}`
          : 'Officer Approved AI Recommendation',
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Submit Dedicated AI Review Decision (Approve, Modify, or Flag for Human Verification)
 * Endpoint: POST /ai/review-decision/:complaintId
 */
export async function submitAIReviewDecision(complaintId, { reviewAction, category, department, severityScore, reason, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/ai/review-decision/${complaintId}`, {
        review_action: reviewAction,
        category,
        department,
        severity_score: severityScore,
        reason,
        officer_name: officerName,
        officer_role: officerRole,
      });
      return normalizeComplaint(data);
    } catch (err) {
      console.warn(`[api] submitAIReviewDecision backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(120);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) {
    throw new Error(`Complaint with ID ${complaintId} not found.`);
  }

  const prev = workingComplaints[index];
  let auditAction = '';
  let updatedState = 'APPROVED';

  if (reviewAction === 'APPROVED') {
    updatedState = 'APPROVED';
    auditAction = `Officer Approved AI Triage Recommendation (Advisory Accepted)`;
  } else if (reviewAction === 'MODIFIED') {
    updatedState = 'MODIFIED';
    auditAction = `Officer Modified AI Recommendation: ${reason || 'Field realignment'}`;
  } else if (reviewAction === 'HUMAN_VERIFICATION_REQUIRED') {
    updatedState = 'HUMAN VERIFICATION REQUIRED';
    auditAction = `Officer Flagged AI Triage for On-Ground Human Verification. Reason: ${reason || 'Inspection required'}`;
  }

  const updated = {
    ...prev,
    aiReviewState: updatedState,
    category: category || prev.category,
    department: department || prev.department,
    severityScore: severityScore !== undefined ? severityScore : prev.severityScore,
    status: prev.status === 'Submitted' || prev.status === 'AI Classified' ? 'Assigned' : prev.status,
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Officer',
        role: officerRole || 'Municipal Officer',
        action: auditAction,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Assign Complaint to Municipal Department and Officer
 * Endpoint: POST /complaints/:id/assign
 */
export async function assignComplaint(complaintId, { department, assignedOfficer, note, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/complaints/${complaintId}/assign`, {
        department,
        assigned_officer: assignedOfficer,
        note,
        officer_name: officerName,
        officer_role: officerRole,
      });
      return normalizeComplaint(data);
    } catch (err) {
      console.warn(`[api] assignComplaint backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(120);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) throw new Error(`Complaint ${complaintId} not found.`);

  const prev = workingComplaints[index];
  const isReassign = Boolean(prev.assignedOfficer && prev.assignedOfficer !== 'UNASSIGNED');

  const updated = {
    ...prev,
    department: department || prev.department,
    assignedOfficer: assignedOfficer || prev.assignedOfficer,
    status: 'Assigned',
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Zonal Officer',
        role: officerRole || 'Municipal Officer',
        action: isReassign
          ? `Reassigned to ${assignedOfficer} (${(department || '').split('&')[0]}): ${note || 'Jurisdiction realignment'}`
          : `Assigned to ${assignedOfficer} (${(department || '').split('&')[0]}): ${note || 'Initial assignment'}`,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Reassign Complaint Alias
 */
export async function reassignComplaint(complaintId, payload) {
  return assignComplaint(complaintId, payload);
}

/**
 * Update Status (Lifecycle state transition with validation)
 * Endpoint: PATCH /complaints/:id/status
 */
export async function updateComplaintStatus(complaintId, { status, reason, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      const backendStatus = {
        Submitted: 'submitted',
        'Under Review': 'in_progress',
        Assigned: 'in_progress',
        'In Progress': 'in_progress',
        Resolved: 'resolved',
        Closed: 'closed',
      }[status] || status;
      const data = await apiClient.put(`/complaints/${complaintId}/status`, { status: backendStatus });
      return normalizeComplaint(unwrapComplaint(data));
    } catch (err) {
      console.warn(`[api] updateComplaintStatus backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(100);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) throw new Error(`Complaint ${complaintId} not found.`);

  const prev = workingComplaints[index];
  const updated = {
    ...prev,
    status,
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Officer',
        role: officerRole || 'Municipal Officer',
        action: `Status transitioned from ${prev.status} → ${status}${reason ? `: ${reason}` : ''}`,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Record Operational Action (Inspection, dispatch, material request)
 * Endpoint: POST /complaints/:id/actions
 */
export async function recordComplaintAction(complaintId, { actionType, description, internalNote, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/complaints/${complaintId}/actions`, {
        action_type: actionType,
        description,
        internal_note: internalNote,
        officer_name: officerName,
        officer_role: officerRole,
      });
      return normalizeComplaint(data);
    } catch (err) {
      console.warn(`[api] recordComplaintAction backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(120);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) throw new Error(`Complaint ${complaintId} not found.`);

  const prev = workingComplaints[index];
  const updated = {
    ...prev,
    status: prev.status === 'Assigned' ? 'In Progress' : prev.status,
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Officer',
        role: officerRole || 'Municipal Officer',
        action: `[${actionType}] ${description}${internalNote ? ` (Internal: ${internalNote})` : ''}`,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Record Operational Action Contract Alias
 */
export async function recordOperationalAction(complaintId, payload) {
  return recordComplaintAction(complaintId, payload);
}

/**
 * Add Resolution Evidence Attachment Metadata / Multipart Upload
 * Endpoint: POST /complaints/:id/evidence
 */
export async function addComplaintEvidence(complaintId, { evidenceType, description, filename, file, metadata, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      if (file && file instanceof File) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('evidenceType', evidenceType || 'image');
        formData.append('caption', description || filename || 'Field resolution proof');
        if (metadata) formData.append('metadata', JSON.stringify(metadata));
        if (officerName) formData.append('officer_name', officerName);
        if (officerRole) formData.append('officer_role', officerRole);

        const data = await apiClient.upload(`/complaints/${complaintId}/evidence`, formData);
        return normalizeComplaint(data);
      } else {
        const data = await apiClient.post(`/complaints/${complaintId}/evidence`, {
          evidence_type: evidenceType || 'image',
          caption: description || filename || 'Field resolution proof',
          filename: filename || 'field_resolution.jpg',
          metadata: metadata || null,
          officer_name: officerName,
          officer_role: officerRole,
        });
        return normalizeComplaint(data);
      }
    } catch (err) {
      console.warn(`[api] addComplaintEvidence backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(100);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) throw new Error(`Complaint ${complaintId} not found.`);

  const prev = workingComplaints[index];
  const newEvidence = {
    type: evidenceType || 'photo',
    url: `/assets/evidence/${filename || 'field_resolution.jpg'}`,
    caption: `${description || 'Field resolution proof'} (${filename || 'photo'})`,
    uploadedAt: new Date().toISOString(),
    uploadedBy: officerName || 'Officer',
  };

  const updated = {
    ...prev,
    evidence: [...(prev.evidence || []), newEvidence],
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Officer',
        role: officerRole || 'Municipal Officer',
        action: `Uploaded resolution evidence: ${filename || 'file'} [${evidenceType || 'photo'}]`,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Upload Evidence Contract Method Alias
 */
export async function uploadEvidence(complaintId, file, metadata = {}) {
  return addComplaintEvidence(complaintId, {
    file,
    evidenceType: metadata.evidenceType || 'photo',
    description: metadata.caption || metadata.description,
    filename: file?.name || 'evidence_upload.jpg',
    metadata,
    officerName: metadata.officerName,
    officerRole: metadata.officerRole,
  });
}

/**
 * Submit Final Operational Resolution
 * Endpoint: POST /complaints/:id/resolve
 */
export async function submitResolution(complaintId, { resolutionType, summary, actionsTaken, affectedArea, citizenNotified, officerName, officerRole, statutory_confirmation, statutoryConfirmation, isConfirmed }) {
  const confirmed = Boolean(
    statutory_confirmation !== undefined
      ? statutory_confirmation
      : statutoryConfirmation !== undefined
      ? statutoryConfirmation
      : isConfirmed !== undefined
      ? isConfirmed
      : false
  );

  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/complaints/${complaintId}/resolve`, {
        resolution_scope: resolutionType,
        resolution_type: resolutionType,
        resolution_summary: summary,
        summary,
        technical_actions: actionsTaken,
        actions_taken: actionsTaken,
        rectified_area_coverage: affectedArea,
        affected_area: affectedArea,
        statutory_confirmation: confirmed,
        statutoryConfirmation: confirmed,
        citizen_notified: citizenNotified ?? true,
        officer_name: officerName,
        officer_role: officerRole,
      });
      return normalizeComplaint(data);
    } catch (err) {
      console.warn(`[api] submitResolution backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(150);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) throw new Error(`Complaint ${complaintId} not found.`);

  const prev = workingComplaints[index];
  const updated = {
    ...prev,
    status: 'Resolved',
    resolvedAt: new Date().toISOString(),
    resolutionDetails: {
      resolutionType,
      summary,
      actionsTaken,
      affectedArea,
      citizenNotified: citizenNotified ?? true,
      resolvedBy: officerName || 'Officer',
    },
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Officer',
        role: officerRole || 'Municipal Officer',
        action: `Resolution Submitted [${resolutionType}]: ${summary}. Actions Taken: ${actionsTaken}. Status changed to Resolved (Awaiting Citizen Confirmation)`,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Record Citizen Resolution Confirmation or Dispute
 * Endpoint: POST /complaints/:id/confirm-resolution
 */
export async function confirmCitizenResolution(complaintId, { confirmed, reason, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/complaints/${complaintId}/confirm-resolution`, {
        confirmed,
        reason,
        officer_name: officerName,
        officer_role: officerRole,
      });
      return normalizeComplaint(data);
    } catch (err) {
      console.warn(`[api] confirmCitizenResolution backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(120);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) throw new Error(`Complaint ${complaintId} not found.`);

  const prev = workingComplaints[index];
  const nextStatus = confirmed ? 'Citizen Confirmed' : 'Reopened';

  const updated = {
    ...prev,
    status: nextStatus,
    citizenConfirmedAt: confirmed ? new Date().toISOString() : null,
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: confirmed ? 'Citizen (Via Portal/SMS OTP)' : 'Citizen (Reported Issue Persists)',
        role: 'Citizen',
        action: confirmed
          ? 'Citizen Confirmed Resolution Satisfaction (Rating: 5/5)'
          : `Citizen Disputed Resolution: Issue Persists (${reason || 'Unresolved'}). Status changed to Reopened.`,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Reopen Complaint with Mandatory Reason
 * Endpoint: POST /complaints/:id/reopen
 */
export async function reopenComplaint(complaintId, { reason, details, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/complaints/${complaintId}/reopen`, {
        reason,
        details,
        officer_name: officerName,
        officer_role: officerRole,
      });
      return normalizeComplaint(data);
    } catch (err) {
      console.warn(`[api] reopenComplaint backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(120);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) throw new Error(`Complaint ${complaintId} not found.`);

  const prev = workingComplaints[index];
  const updated = {
    ...prev,
    status: 'Reopened',
    reopenedAt: new Date().toISOString(),
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Officer',
        role: officerRole || 'Municipal Officer',
        action: `Officer Reopened Complaint. Reason: ${reason}${details ? ` (Details: ${details})` : ''}`,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Escalate Complaint (Level 1 → Level 2 → Level 3)
 * Endpoint: POST /complaints/:id/escalate
 */
export async function escalateComplaint(complaintId, { targetLevel, targetRole, reason, note, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/complaints/${complaintId}/escalate`, {
        target_level: targetLevel,
        target_role: targetRole,
        reason,
        note,
        officer_name: officerName,
        officer_role: officerRole,
      });
      return normalizeComplaint(data);
    } catch (err) {
      console.warn(`[api] escalateComplaint backend call failed for ${complaintId}, using prototype fallback:`, err.message);
    }
  }

  await delay(120);
  const index = workingComplaints.findIndex(c => c.complaintId === complaintId);
  if (index === -1) throw new Error(`Complaint ${complaintId} not found.`);

  const prev = workingComplaints[index];
  const newLevel = targetLevel || (prev.escalationLevel || 1) + 1;

  const updated = {
    ...prev,
    status: 'Escalated',
    escalationLevel: newLevel,
    escalatedAt: new Date().toISOString(),
    auditHistory: [
      ...prev.auditHistory,
      {
        timestamp: new Date().toISOString(),
        actor: officerName || 'Officer',
        role: officerRole || 'Municipal Officer',
        action: `Escalated to Level ${newLevel} (${targetRole || 'Department Head'}). Reason: ${reason}${note ? ` (Note: ${note})` : ''}`,
      },
    ],
  };

  const nextList = [...workingComplaints];
  nextList[index] = updated;
  saveWorkingState(nextList);
  return { ...updated };
}

/**
 * Fetch Macro Analytics Data
 * Endpoint: GET /analytics/summary
 */
export async function getAnalytics() {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/summary');
      return data;
    } catch (err) {
      console.warn('[api] getAnalytics backend call failed, using prototype fallback:', err.message);
    }
  }

  await delay();
  return {
    ...mockDashboardStats,
    wards: MUNICIPAL_WARDS,
    categories: MUNICIPAL_CATEGORIES,
    departments: MUNICIPAL_DEPARTMENTS,
  };
}

/**
 * Fetch Ward Hotspot Intelligence
 * Endpoint: GET /gis/hotspots
 */
export async function getHotspots() {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/gis/hotspots');
      return data;
    } catch (err) {
      console.warn('[api] getHotspots backend call failed, using prototype fallback:', err.message);
    }
  }

  await delay();
  return [...mockHotspots];
}

/**
 * Fetch Audit History for a Complaint or General Ledger
 * Endpoint: GET /audit/logs
 */
export async function getAuditLogs(complaintId = null) {
  if (isApiMode()) {
    try {
      const endpoint = complaintId ? `/audit/logs/${complaintId}` : '/audit/logs';
      const data = await apiClient.get(endpoint);
      return data;
    } catch (err) {
      console.warn(`[api] getAuditLogs backend call failed, using prototype fallback:`, err.message);
    }
  }

  await delay();
  if (complaintId) {
    const complaint = workingComplaints.find(c => c.complaintId === complaintId);
    return complaint ? [...complaint.auditHistory] : [];
  }

  // Flatten all complaint audits for general audit ledger
  const allLogs = [];
  workingComplaints.forEach(c => {
    c.auditHistory.forEach(log => {
      allLogs.push({
        ...log,
        complaintId: c.complaintId,
        category: c.category,
        ward: c.ward,
      });
    });
  });

  return allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
