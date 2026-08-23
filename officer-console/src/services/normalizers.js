// ============================================================================
// JanSeva AI — Data Normalization & Contract Translation Layer
// ============================================================================
// Seamlessly bridges differences between backend naming conventions (e.g. snake_case)
// and the established frontend JanSeva models (camelCase) to ensure zero component regressions.

/**
 * Normalize a single audit log entry from backend
 */
export function normalizeAuditLog(rawLog = {}) {
  if (!rawLog) return null;
  return {
    timestamp: rawLog.timestamp || rawLog.created_at || new Date().toISOString(),
    actor: rawLog.actor || rawLog.officer_name || rawLog.user_name || 'Municipal Officer',
    role: rawLog.role || rawLog.officer_role || 'Officer',
    action: rawLog.action || rawLog.description || rawLog.event_description || 'Operational action recorded',
    details: rawLog.details || rawLog.metadata || null,
  };
}

/**
 * Normalize an evidence item from backend
 */
export function normalizeEvidence(rawEv = {}) {
  if (!rawEv) return null;
  return {
    type: rawEv.type || rawEv.evidence_type || 'image',
    url: rawEv.url || rawEv.file_url || rawEv.path || '/assets/evidence/field_resolution.jpg',
    caption: rawEv.caption || rawEv.description || 'Field resolution proof',
    uploadedAt: rawEv.uploadedAt || rawEv.uploaded_at || rawEv.created_at || new Date().toISOString(),
    uploadedBy: rawEv.uploadedBy || rawEv.uploaded_by || 'Officer',
  };
}

/**
 * Normalize a raw backend complaint object into standard JanSeva frontend schema
 */
export function normalizeComplaint(raw = {}) {
  if (!raw) return null;

  const complaintId = raw.complaintId || raw.complaint_id || raw.id || 'GRV-UNKNOWN';
  const rawCoords = raw.coordinates || raw.location_coordinates || {};

  return {
    complaintId,
    title: raw.title || raw.subject || 'Untitled Municipal Grievance',
    description: raw.description || raw.details || '',
    category: raw.category || raw.predicted_category || 'General',
    location: raw.location || raw.address || 'Pune Municipal Zone',
    ward: raw.ward || raw.ward_id || 'Ward 12',
    coordinates: {
      lat: rawCoords.lat ?? rawCoords.latitude ?? 18.5204,
      lng: rawCoords.lng ?? rawCoords.longitude ?? 73.8567,
    },
    priority: raw.priority || 'Medium',
    severityScore: raw.severityScore ?? raw.severity_score ?? 50,
    aiConfidence: raw.aiConfidence ?? raw.ai_confidence ?? 85,
    authenticityScore: raw.authenticityScore ?? raw.authenticity_score ?? 90,
    authenticityStatus: raw.authenticityStatus || raw.authenticity_status || 'Likely Genuine',
    duplicateCount: raw.duplicateCount ?? raw.duplicate_count ?? 1,
    masterIssueId: raw.masterIssueId || raw.master_issue_id || null,
    department: raw.department || raw.recommended_department || 'General Administration',
    assignedOfficer: raw.assignedOfficer || raw.assigned_officer || 'UNASSIGNED',
    status: raw.status || 'Submitted',
    slaStatus: raw.slaStatus || raw.sla_status || 'ON TRACK',
    slaDeadline: raw.slaDeadline || raw.sla_deadline || new Date(Date.now() + 48 * 3600000).toISOString(),
    slaRemainingHours: raw.slaRemainingHours ?? raw.sla_remaining_hours ?? 24,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    submittedBy: raw.submittedBy || raw.submitted_by || raw.citizen_name || 'Citizen',
    citizenContact: raw.citizenContact || raw.citizen_contact || raw.citizen_phone || '+91 98000-00000',
    aiReviewState: raw.aiReviewState || raw.ai_review_state || (raw.status === 'Submitted' ? 'PENDING REVIEW' : 'APPROVED'),
    evidence: Array.isArray(raw.evidence) ? raw.evidence.map(normalizeEvidence) : [],
    aiSummary: raw.aiSummary || raw.ai_summary || raw.summary || 'AI triage assessment completed.',
    predictedCategory: raw.predictedCategory || raw.predicted_category || raw.category || 'General',
    recommendedDepartment: raw.recommendedDepartment || raw.recommended_department || raw.department || 'General Administration',
    routingConfidence: raw.routingConfidence ?? raw.routing_confidence ?? 90,
    xaiFactors: Array.isArray(raw.xaiFactors || raw.xai_factors)
      ? (raw.xaiFactors || raw.xai_factors).map(f => ({
          name: f.name || f.factor_name || 'Contributing Signal',
          contribution: f.contribution ?? f.weight ?? 20,
          explanation: f.explanation || f.description || '',
        }))
      : [],
    routingReasons: raw.routingReasons || raw.routing_reasons || [],
    authenticityReasons: raw.authenticityReasons || raw.authenticity_reasons || [],
    severityFactors: raw.severityFactors || raw.severity_factors || [],
    auditHistory: Array.isArray(raw.auditHistory || raw.audit_history || raw.logs)
      ? (raw.auditHistory || raw.audit_history || raw.logs).map(normalizeAuditLog)
      : [],
    resolutionDetails: raw.resolutionDetails || raw.resolution_details || null,
    resolvedAt: raw.resolvedAt || raw.resolved_at || null,
    escalationLevel: raw.escalationLevel ?? raw.escalation_level ?? 1,
    escalatedAt: raw.escalatedAt || raw.escalated_at || null,
    reopenedAt: raw.reopenedAt || raw.reopened_at || null,
    citizenConfirmedAt: raw.citizenConfirmedAt || raw.citizen_confirmed_at || null,
  };
}

/**
 * Normalize an array of complaint objects
 */
export function normalizeComplaintsList(list = []) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeComplaint).filter(Boolean);
}

/**
 * Normalize AI Recommendation payload
 */
export function normalizeAIRecommendation(raw = {}) {
  if (!raw) return null;
  return {
    complaintId: raw.complaintId || raw.complaint_id,
    predictedCategory: raw.predictedCategory || raw.predicted_category || 'General',
    recommendedDepartment: raw.recommendedDepartment || raw.recommended_department || 'General Administration',
    severityScore: raw.severityScore ?? raw.severity_score ?? 50,
    authenticityTrustIndex: raw.authenticityTrustIndex ?? raw.authenticity_trust_index ?? raw.authenticityScore ?? 90,
    confidence: raw.confidence ?? raw.aiConfidence ?? raw.ai_confidence ?? 85,
    routingConfidence: raw.routingConfidence ?? raw.routing_confidence ?? 90,
    xaiFactors: raw.xaiFactors || raw.xai_factors || [],
    routingReasons: raw.routingReasons || raw.routing_reasons || [],
    authenticityReasons: raw.authenticityReasons || raw.authenticity_reasons || [],
    severityFactors: raw.severityFactors || raw.severity_factors || [],
    duplicateCluster: raw.duplicateCluster || raw.duplicate_cluster || null,
    aiSummary: raw.aiSummary || raw.ai_summary || '',
  };
}

/**
 * Normalize Officer/User session data from auth endpoint
 */
export function normalizeOfficerSession(raw = {}) {
  if (!raw) return null;
  const rawUser = raw.user || raw.officer || raw;
  const role = rawUser.role === 'official' || rawUser.email === 'official@janseva.ai'
    ? 'Senior Municipal Commissioner'
    : rawUser.role === 'officer'
      ? 'Zonal Ward Officer'
      : rawUser.role;

  return {
    user: {
      id: rawUser.id || rawUser.officer_id || 'OFF-DEFAULT',
      name: rawUser.name || rawUser.officer_name || 'Municipal Officer',
      email: rawUser.email || 'officer@gov.in',
      role: role || rawUser.designation || 'Zonal Ward Officer',
      department: rawUser.department || 'Municipal Administration',
      ward: rawUser.ward || rawUser.jurisdiction || 'Ward 12',
      phone: rawUser.phone || rawUser.contact || '+91 98000-00000',
      authorityLevel: rawUser.authorityLevel || rawUser.authority_level || 'Level 2 — Zonal Ward Executive',
      authorityLevelNumber: rawUser.authorityLevelNumber ?? rawUser.authority_level_number ?? 2,
      permissions: rawUser.permissions || [],
      accountStatus: rawUser.accountStatus || rawUser.account_status || 'Active & Authorized',
      lastSession: rawUser.lastSession || rawUser.last_session || new Date().toISOString(),
    },
    token: raw.token || raw.accessToken || raw.access_token || `jwt_${Date.now()}`,
    expiresAt: raw.expiresAt || raw.expires_at || new Date(Date.now() + 24 * 3600000).toISOString(),
    sessionCreated: raw.sessionCreated || raw.session_created || new Date().toISOString(),
  };
}

/**
 * Transform frontend complaint filter parameters to backend query params
 */
export function denormalizeQueryParams(params = {}) {
  const query = {};
  if (params.search) query.q = params.search;
  if (params.category && params.category !== 'All') query.category = params.category;
  if (params.ward && params.ward !== 'All') query.ward = params.ward;
  if (params.priority && params.priority !== 'All') query.priority = params.priority;
  if (params.status && params.status !== 'All') query.status = params.status;
  if (params.slaStatus && params.slaStatus !== 'All') query.sla_status = params.slaStatus;
  if (params.limit) query.limit = params.limit;
  if (params.page) query.page = params.page;
  return query;
}
