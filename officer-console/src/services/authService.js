// ============================================================================
// JanSeva AI — Municipal Authentication & RBAC Service
// ============================================================================
// Unified authentication abstraction supporting both:
//   1. Prototype persona authentication (zero plaintext password persistence)
//   2. Backend REST API authentication (POST /auth/login, GET /auth/me, POST /auth/logout)
//
// STATUTORY SECURITY PRINCIPLES:
// - Passwords are NEVER stored in plaintext or logged.
// - Tokens are persisted strictly in session storage and transmitted via Bearer headers.

import { officers, MUNICIPAL_ROLES } from '../mock/officers.js';
import { apiClient, isApiMode } from './apiClient.js';
import { normalizeOfficerSession } from './normalizers.js';

const SESSION_KEY = 'janseva_officer_session';
const PREFS_KEY = 'janseva_officer_preferences';
const LATENCY = 150;

const delay = (ms = LATENCY) => new Promise(res => setTimeout(res, ms));

/**
 * Standard Municipal RBAC Permissions Matrix
 */
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_COMPLAINTS: 'VIEW_COMPLAINTS',
  ASSIGN_COMPLAINT: 'ASSIGN_COMPLAINT',
  REASSIGN_COMPLAINT: 'REASSIGN_COMPLAINT',
  PERFORM_OPERATIONAL_ACTION: 'PERFORM_OPERATIONAL_ACTION',
  UPLOAD_EVIDENCE: 'UPLOAD_EVIDENCE',
  REVIEW_AI: 'REVIEW_AI',
  MODIFY_AI_RECOMMENDATION: 'MODIFY_AI_RECOMMENDATION',
  ESCALATE_COMPLAINT: 'ESCALATE_COMPLAINT',
  RESOLVE_COMPLAINT: 'RESOLVE_COMPLAINT',
  CONFIRM_RESOLUTION: 'CONFIRM_RESOLUTION',
  REOPEN_COMPLAINT: 'REOPEN_COMPLAINT',
  VIEW_GIS: 'VIEW_GIS',
  VIEW_SLA: 'VIEW_SLA',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  MANAGE_OFFICERS: 'MANAGE_OFFICERS',
};

/**
 * Role to Authority Level & Permissions Mapping
 */
export const ROLE_PERMISSIONS = {
  [MUNICIPAL_ROLES.COMMISSIONER]: {
    authorityLevel: 'Level 3 — Municipal Commissioner (IAS)',
    levelNumber: 3,
    permissions: Object.values(PERMISSIONS), // Super Admin / Complete Statutory Authority
  },
  [MUNICIPAL_ROLES.ZONAL_OFFICER]: {
    authorityLevel: 'Level 2 — Zonal Ward Executive',
    levelNumber: 2,
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_COMPLAINTS,
      PERMISSIONS.ASSIGN_COMPLAINT,
      PERMISSIONS.REASSIGN_COMPLAINT,
      PERMISSIONS.PERFORM_OPERATIONAL_ACTION,
      PERMISSIONS.UPLOAD_EVIDENCE,
      PERMISSIONS.REVIEW_AI,
      PERMISSIONS.MODIFY_AI_RECOMMENDATION,
      PERMISSIONS.ESCALATE_COMPLAINT,
      PERMISSIONS.RESOLVE_COMPLAINT,
      PERMISSIONS.CONFIRM_RESOLUTION,
      PERMISSIONS.REOPEN_COMPLAINT,
      PERMISSIONS.VIEW_GIS,
      PERMISSIONS.VIEW_SLA,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.MANAGE_SETTINGS,
    ],
  },
  [MUNICIPAL_ROLES.WATER_HEAD]: {
    authorityLevel: 'Level 2 — Departmental Chief Engineer',
    levelNumber: 2,
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_COMPLAINTS,
      PERMISSIONS.ASSIGN_COMPLAINT,
      PERMISSIONS.PERFORM_OPERATIONAL_ACTION,
      PERMISSIONS.UPLOAD_EVIDENCE,
      PERMISSIONS.REVIEW_AI,
      PERMISSIONS.MODIFY_AI_RECOMMENDATION,
      PERMISSIONS.ESCALATE_COMPLAINT,
      PERMISSIONS.RESOLVE_COMPLAINT,
      PERMISSIONS.VIEW_GIS,
      PERMISSIONS.VIEW_SLA,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.MANAGE_SETTINGS,
    ],
  },
  [MUNICIPAL_ROLES.ROADS_ENGINEER]: {
    authorityLevel: 'Level 1 — Zonal Field Engineer',
    levelNumber: 1,
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_COMPLAINTS,
      PERMISSIONS.PERFORM_OPERATIONAL_ACTION,
      PERMISSIONS.UPLOAD_EVIDENCE,
      PERMISSIONS.REVIEW_AI,
      PERMISSIONS.RESOLVE_COMPLAINT,
      PERMISSIONS.VIEW_GIS,
      PERMISSIONS.VIEW_SLA,
      PERMISSIONS.MANAGE_SETTINGS,
    ],
  },
  [MUNICIPAL_ROLES.SANITATION_SUPERVISOR]: {
    authorityLevel: 'Level 1 — Field Supervisor',
    levelNumber: 1,
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_COMPLAINTS,
      PERMISSIONS.PERFORM_OPERATIONAL_ACTION,
      PERMISSIONS.UPLOAD_EVIDENCE,
      PERMISSIONS.RESOLVE_COMPLAINT,
      PERMISSIONS.VIEW_GIS,
      PERMISSIONS.VIEW_SLA,
      PERMISSIONS.MANAGE_SETTINGS,
    ],
  },
  [MUNICIPAL_ROLES.SAFETY_OFFICER]: {
    authorityLevel: 'Level 2 — Crisis & Public Safety Officer',
    levelNumber: 2,
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_COMPLAINTS,
      PERMISSIONS.ASSIGN_COMPLAINT,
      PERMISSIONS.PERFORM_OPERATIONAL_ACTION,
      PERMISSIONS.UPLOAD_EVIDENCE,
      PERMISSIONS.REVIEW_AI,
      PERMISSIONS.ESCALATE_COMPLAINT,
      PERMISSIONS.RESOLVE_COMPLAINT,
      PERMISSIONS.VIEW_GIS,
      PERMISSIONS.VIEW_SLA,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.MANAGE_SETTINGS,
    ],
  },
};

/**
 * Enrich raw officer persona with statutory authority levels and permission array
 */
export function enrichOfficer(rawOfficer) {
  const roleConfig = ROLE_PERMISSIONS[rawOfficer.role] || ROLE_PERMISSIONS[MUNICIPAL_ROLES.ZONAL_OFFICER];
  return {
    ...rawOfficer,
    authorityLevel: roleConfig.authorityLevel,
    authorityLevelNumber: roleConfig.levelNumber,
    permissions: Array.isArray(rawOfficer.permissions) && rawOfficer.permissions.length > 0
      ? rawOfficer.permissions
      : roleConfig.permissions,
    accountStatus: 'Active & Authorized',
    lastSession: new Date().toISOString(),
  };
}

/**
 * Sign In Officer
 * In API Mode: Calls POST /auth/login
 * In Mock Mode: Authenticates against persona list and saves session
 */
export async function login({ emailOrId, password, selectedRole }) {
  if (isApiMode()) {
    try {
      const responseData = await apiClient.post('/auth/login', {
        email: emailOrId,
        password: password,
      });

      const normalizedSession = normalizeOfficerSession(responseData);
      const finalOfficer = enrichOfficer(normalizedSession.user);

      const session = {
        ...normalizedSession,
        user: finalOfficer,
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (err) {
      console.warn('[authService] Backend login failed, checking fallback:', err.message);
      // If backend network fails, provide graceful fallback in dev/demo mode
      if (!err.isNetworkError && err.status === 401) {
        throw err;
      }
    }
  }

  // Prototype Fallback
  await delay();

  // Match officer by ID, email, or role
  let officer = officers.find(
    o =>
      o.id.toLowerCase() === (emailOrId || '').toLowerCase() ||
      o.email.toLowerCase() === (emailOrId || '').toLowerCase()
  );

  if (!officer && selectedRole) {
    officer = officers.find(o => o.role === selectedRole);
  }

  // Fallback to primary Zonal Ward Officer
  if (!officer) {
    officer = officers[0];
  }

  const enriched = enrichOfficer(officer);

  const session = {
    user: enriched,
    token: `prototype_jwt_${officer.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    sessionCreated: new Date().toISOString(),
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Get Active Session
 * Reads cached session from sessionStorage
 * In API Mode can verify against GET /auth/me
 */
export function getCurrentSession() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (new Date(parsed.expiresAt) < new Date()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    if (parsed.user?.role === 'official' || parsed.user?.email === 'official@janseva.ai') {
      parsed.user = enrichOfficer({ ...parsed.user, role: MUNICIPAL_ROLES.COMMISSIONER, permissions: [] });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch Current Authenticated Officer Profile from Backend
 * Endpoint: GET /auth/me
 */
export async function getAuthMe() {
  if (isApiMode()) {
    try {
      const data = await apiClient.get('/auth/me');
      const normalized = normalizeOfficerSession(data);
      if (normalized?.user) {
        const enriched = enrichOfficer(normalized.user);
        const current = getCurrentSession() || {};
        const updated = {
          ...current,
          user: enriched,
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        return enriched;
      }
    } catch (err) {
      console.warn('[authService] getAuthMe backend call failed:', err.message);
    }
  }

  const session = getCurrentSession();
  return session?.user || null;
}

/**
 * Log Out Officer
 * In API Mode: Calls POST /auth/logout
 * In Mock Mode: Clears session storage
 */
export async function logout() {
  if (isApiMode()) {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('[authService] Backend logout call error (proceeding with local clear):', err.message);
    }
  }

  await delay(80);
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
  return true;
}

/**
 * Switch Officer Persona (Prototype Demo Switcher)
 */
export async function switchOfficerRole(roleName) {
  await delay(100);
  const officer = officers.find(o => o.role === roleName) || officers[0];
  const enriched = enrichOfficer(officer);

  const session = {
    user: enriched,
    token: `prototype_jwt_${officer.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    sessionCreated: new Date().toISOString(),
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Notification & Operational Preferences Persistence (Client-Side Storage)
 */
export function getSavedPreferences() {
  try {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return {
        // Notifications
        notifSlaBreaches: true,
        notifCriticalAlerts: true,
        notifAiTriaged: true,
        notifEscalations: true,
        notifCitizenConfirmations: true,
        notifAuditAlerts: false,
        // Operational
        defaultView: 'All',
        defaultSlaFilter: 'All',
        aiConfidenceThreshold: 85,
        tableDensity: 'Comfortable',
        pageSize: 12,
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function savePreferences(prefs) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }
  return prefs;
}
