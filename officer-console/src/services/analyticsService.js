// ============================================================================
// JanSeva AI — Municipal Analytics & AI Evaluation Service
// ============================================================================
// Derives citywide operational trends, AI decision metrics, civic integrity signals,
// and ward performance tables from the authoritative municipal dataset with backend REST endpoints.

import { MUNICIPAL_DEPARTMENTS, MUNICIPAL_CATEGORIES } from '../data/mockData';
import { calculateWardHotspots } from './gisService';
import { apiClient, isApiMode } from './apiClient';
import { getComplaints } from './api';

/**
 * Calculate Global Macro Analytics KPIs (Deterministic Fallback)
 */
export function getAnalyticsSummary(complaints = []) {
  const total = complaints.length;
  if (total === 0) {
    return {
      totalComplaints: 0,
      criticalRate: '0%',
      slaComplianceRate: '100%',
      resolutionRate: '0%',
      aiReviewRate: '0%',
      humanReviewRate: '0%',
      authenticityFlagRate: '0%',
      duplicateRate: '0%',
    };
  }

  const criticalCount = complaints.filter(c => c.priority === 'Critical').length;
  const resolvedCount = complaints.filter(
    c => c.status === 'Resolved' || c.status === 'Citizen Confirmed'
  ).length;

  const onTrackCount = complaints.filter(
    c => c.slaStatus === 'ON TRACK' || !c.slaStatus
  ).length;

  const reviewedCount = complaints.filter(
    c => c.aiReviewState === 'APPROVED' || c.aiReviewState === 'MODIFIED'
  ).length;

  const humanVerificationCount = complaints.filter(
    c => c.aiReviewState === 'HUMAN VERIFICATION REQUIRED' || c.authenticityStatus === 'Suspicious' || (c.aiConfidence || 0) < 75
  ).length;

  const suspiciousCount = complaints.filter(
    c => c.authenticityStatus === 'Suspicious' || (c.authenticityScore && c.authenticityScore < 60)
  ).length;

  const duplicateLinkedCount = complaints.filter(
    c => c.duplicateCount && c.duplicateCount > 1
  ).length;

  return {
    totalComplaints: total,
    criticalRate: `${Math.round((criticalCount / total) * 100)}%`,
    slaComplianceRate: `${Math.round((onTrackCount / total) * 100)}%`,
    resolutionRate: `${Math.round((resolvedCount / total) * 100)}%`,
    aiReviewRate: `${Math.round((reviewedCount / total) * 100)}%`,
    humanReviewRate: `${Math.round((humanVerificationCount / total) * 100)}%`,
    authenticityFlagRate: `${Math.round((suspiciousCount / total) * 100)}%`,
    duplicateRate: `${Math.round((duplicateLinkedCount / total) * 100)}%`,
  };
}

/**
 * Calculate Complaint Volume per Department (Deterministic Fallback)
 */
export function getDepartmentDistribution(complaints = []) {
  const counts = {};
  const total = complaints.length;

  Object.values(MUNICIPAL_DEPARTMENTS).forEach(dept => {
    counts[dept] = 0;
  });

  complaints.forEach(c => {
    const dept = c.department || MUNICIPAL_DEPARTMENTS.WATER;
    counts[dept] = (counts[dept] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([department, count]) => ({
      department,
      shortName: department.split('&')[0].trim(),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate Priority Distribution Breakdown (Deterministic Fallback)
 */
export function getPriorityDistribution(complaints = []) {
  const total = complaints.length;
  const critical = complaints.filter(c => c.priority === 'Critical').length;
  const high = complaints.filter(c => c.priority === 'High').length;
  const medium = complaints.filter(c => c.priority === 'Medium').length;
  const low = complaints.filter(c => c.priority === 'Low').length;

  return [
    { label: 'Critical', count: critical, color: 'var(--color-critical)', bg: 'var(--color-critical-bg)', percent: total > 0 ? Math.round((critical / total) * 100) : 0 },
    { label: 'High', count: high, color: 'var(--color-high)', bg: 'var(--color-high-bg)', percent: total > 0 ? Math.round((high / total) * 100) : 0 },
    { label: 'Medium', count: medium, color: 'var(--color-moderate)', bg: 'var(--color-moderate-bg)', percent: total > 0 ? Math.round((medium / total) * 100) : 0 },
    { label: 'Low', count: low, color: 'var(--color-primary-light)', bg: 'var(--color-primary-tint)', percent: total > 0 ? Math.round((low / total) * 100) : 0 },
  ];
}

/**
 * Calculate Operational AI Decision Support Evaluation Metrics (Deterministic Fallback)
 */
export function getAIReviewAnalytics(complaints = []) {
  const total = complaints.length;
  const approved = complaints.filter(c => c.aiReviewState === 'APPROVED').length;
  const modified = complaints.filter(c => c.aiReviewState === 'MODIFIED').length;
  const verificationReq = complaints.filter(c => c.aiReviewState === 'HUMAN VERIFICATION REQUIRED').length;
  const pending = complaints.filter(c => !c.aiReviewState || c.aiReviewState === 'PENDING REVIEW').length;

  const totalReviewed = approved + modified;
  const overrideRate = totalReviewed > 0 ? `${Math.round((modified / totalReviewed) * 100)}%` : 'No reviewed records yet';

  // Confidence Tiers
  const highConf = complaints.filter(c => (c.aiConfidence || 0) >= 90).length;
  const medConf = complaints.filter(c => (c.aiConfidence || 0) >= 75 && (c.aiConfidence || 0) < 90).length;
  const lowConf = complaints.filter(c => (c.aiConfidence || 0) < 75).length;

  return {
    total,
    approvedCount: approved,
    modifiedCount: modified,
    verificationReqCount: verificationReq,
    pendingCount: pending,
    totalReviewed,
    overrideRate,
    confidenceTiers: {
      high: { count: highConf, percent: total > 0 ? Math.round((highConf / total) * 100) : 0 },
      medium: { count: medConf, percent: total > 0 ? Math.round((medConf / total) * 100) : 0 },
      low: { count: lowConf, percent: total > 0 ? Math.round((lowConf / total) * 100) : 0 },
    },
  };
}

/**
 * Calculate Civic Integrity & Authenticity Signals (Deterministic Fallback)
 */
export function getAuthenticityAnalytics(complaints = []) {
  const total = complaints.length;
  const genuine = complaints.filter(c => c.authenticityStatus === 'Likely Genuine' || !c.authenticityStatus).length;
  const needsVerification = complaints.filter(c => c.authenticityStatus === 'Needs Verification').length;
  const suspicious = complaints.filter(c => c.authenticityStatus === 'Suspicious').length;

  return {
    genuineCount: genuine,
    needsVerificationCount: needsVerification,
    suspiciousCount: suspicious,
    suspiciousRate: total > 0 ? `${Math.round((suspicious / total) * 100)}%` : '0%',
    genuineRate: total > 0 ? `${Math.round((genuine / total) * 100)}%` : '100%',
  };
}

/**
 * Calculate Duplicate & Spatial Clustering Analytics (Deterministic Fallback)
 */
export function getClusterAnalytics(complaints = []) {
  const clusterComplaints = complaints.filter(c => c.duplicateCount && c.duplicateCount > 1);
  const totalDuplicateReports = clusterComplaints.reduce((acc, c) => acc + (c.duplicateCount || 1), 0);

  let largestCluster = { id: 'N/A', count: 0, title: 'None', ward: 'N/A' };
  complaints.forEach(c => {
    if (c.duplicateCount && c.duplicateCount > largestCluster.count) {
      largestCluster = {
        id: c.masterIssueId || `CLUSTER-${c.complaintId.replace('GRV-', '')}`,
        complaintId: c.complaintId,
        count: c.duplicateCount,
        title: c.title,
        ward: c.ward,
        category: c.category,
      };
    }
  });

  return {
    clusteredTicketsCount: clusterComplaints.length,
    totalCorroboratingReports: totalDuplicateReports,
    largestCluster,
    avgClusterSize: clusterComplaints.length > 0 ? (totalDuplicateReports / clusterComplaints.length).toFixed(1) : '1.0',
  };
}

/**
 * Calculate Ward Performance List for Analytics Table
 */
export function getWardAnalytics(complaints = []) {
  return calculateWardHotspots(complaints);
}

// ============================================================================
// Async REST Contract Methods
// ============================================================================

/**
 * Fetch Macro City KPIs from Backend
 * Endpoint: GET /analytics/kpis
 */
export async function getCityKPIs(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/kpis', { params: filters });
      return data;
    } catch (err) {
      console.warn('[analyticsService] getCityKPIs backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getAnalyticsSummary(complaints);
}

/**
 * Fetch Departmental Complaint Volume from Backend
 * Endpoint: GET /analytics/departments
 */
export async function getDepartmentVolume(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/departments', { params: filters });
      return data;
    } catch (err) {
      console.warn('[analyticsService] getDepartmentVolume backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getDepartmentDistribution(complaints);
}

/**
 * Fetch Priority Distribution from Backend
 * Endpoint: GET /analytics/priorities
 */
export async function getPriorityDistributionData(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/priorities', { params: filters });
      return data;
    } catch (err) {
      console.warn('[analyticsService] getPriorityDistributionData backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getPriorityDistribution(complaints);
}

/**
 * Fetch AI Review Metrics from Backend
 * Endpoint: GET /analytics/ai-reviews
 */
export async function getAIReviewMetrics(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/ai-reviews', { params: filters });
      return data;
    } catch (err) {
      console.warn('[analyticsService] getAIReviewMetrics backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getAIReviewAnalytics(complaints);
}

/**
 * Fetch Civic Integrity & Authenticity Signals from Backend
 * Endpoint: GET /analytics/civic-integrity
 */
export async function getCivicIntegrityMetrics(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/civic-integrity', { params: filters });
      return data;
    } catch (err) {
      console.warn('[analyticsService] getCivicIntegrityMetrics backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getAuthenticityAnalytics(complaints);
}

/**
 * Fetch Duplicate & Spatial Clustering Statistics from Backend
 * Endpoint: GET /analytics/clusters
 */
export async function getClusterStatistics(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/clusters', { params: filters });
      return data;
    } catch (err) {
      console.warn('[analyticsService] getClusterStatistics backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getClusterAnalytics(complaints);
}

/**
 * Fetch Ward Performance Metrics from Backend
 * Endpoint: GET /analytics/wards
 */
export async function getWardPerformance(filters = {}) {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/analytics/wards', { params: filters });
      return data;
    } catch (err) {
      console.warn('[analyticsService] getWardPerformance backend call failed, using prototype:', err.message);
    }
  }
  const complaints = await getComplaints(filters);
  return getWardAnalytics(complaints);
}
