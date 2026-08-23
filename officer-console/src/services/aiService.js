// ============================================================================
// JanSeva AI — Explainable AI (XAI) & Advisory Review Service
// ============================================================================
// Provides advisory AI triage recommendations, feature attribution radar factors,
// and statutory Human-in-the-Loop review decision workflows.
//
// STATUTORY GOVERNANCE PRINCIPLE:
// AI models in JanSeva remain strictly advisory decision support systems.
// Statutory executive authority is solely exercised by authorized municipal officers.

import { apiClient, isApiMode } from './apiClient';
import { normalizeAIRecommendation } from './normalizers';
import { getAIAnalysis, submitAIReviewDecision as mockSubmitAIReviewDecision } from './api';

/**
 * Fetch AI Triage Recommendation & Explainability (XAI) Factors for a Grievance
 * Endpoint: GET /ai/recommendations/:complaintId
 */
export async function getAIRecommendation(complaintId) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get(`/ai/recommendations/${complaintId}`);
      return normalizeAIRecommendation(data);
    } catch (err) {
      console.warn(`[aiService] Backend recommendation fetch failed for ${complaintId}, falling back to prototype:`, err.message);
    }
  }

  // Prototype Fallback
  const analysis = await getAIAnalysis(complaintId);
  return normalizeAIRecommendation(analysis);
}

/**
 * Submit Human-in-the-Loop Officer Review Decision (Approve or Modify AI Advisory)
 * Endpoint: POST /ai/review-decision/:complaintId
 *
 * Expected payload:
 * {
 *   reviewAction: 'APPROVED' | 'MODIFIED' | 'HUMAN_VERIFICATION_REQUIRED',
 *   category?: string,
 *   department?: string,
 *   severityScore?: number,
 *   reason?: string,
 *   officerName?: string,
 *   officerRole?: string
 * }
 */
export async function submitAIReviewDecision(complaintId, payload = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/ai/review-decision/${complaintId}`, {
        review_action: payload.reviewAction,
        category: payload.category,
        department: payload.department,
        severity_score: payload.severityScore,
        reason: payload.reason,
        officer_name: payload.officerName,
        officer_role: payload.officerRole,
      });
      return data;
    } catch (err) {
      console.warn(`[aiService] Backend review decision submit failed for ${complaintId}, falling back to prototype:`, err.message);
    }
  }

  // Prototype Fallback
  return mockSubmitAIReviewDecision(complaintId, payload);
}

/**
 * Request Dedicated On-Ground Human Officer Verification for Anomalous / Low-Confidence AI Triage
 * Endpoint: POST /ai/request-verification/:complaintId
 */
export async function requestHumanVerification(complaintId, { reason, officerName, officerRole }) {
  if (isApiMode()) {
    try {
      const data = await apiClient.post(`/ai/request-verification/${complaintId}`, {
        reason: reason || 'Field inspection required to verify AI confidence signals',
        officer_name: officerName,
        officer_role: officerRole,
      });
      return data;
    } catch (err) {
      console.warn(`[aiService] Backend human verification request failed for ${complaintId}, falling back to prototype:`, err.message);
    }
  }

  // Prototype Fallback
  return mockSubmitAIReviewDecision(complaintId, {
    reviewAction: 'HUMAN_VERIFICATION_REQUIRED',
    reason: reason || 'Low confidence or conflicting signals require field inspection',
    officerName,
    officerRole,
  });
}

export default {
  getAIRecommendation,
  submitAIReviewDecision,
  requestHumanVerification,
};
