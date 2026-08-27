import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically to every request if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('janseva_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we are already on login or checking public endpoints
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        console.warn('Session expired or unauthorized. Token cleared.');
        localStorage.removeItem('janseva_token');
        localStorage.removeItem('janseva_user');
      }
    }
    return Promise.reject(error);
  }
);

/* ============================================================
   AUTH API
   ============================================================ */
export const authAPI = {
  register: async (payload) => {
    // payload: { name, email, phone, password, role }
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },
};

/* ============================================================
   COMPLAINTS & PIPELINE API
   ============================================================ */
export const complaintsAPI = {
  // Citizen submit complaint (text + auto triage)
  create: async (payload) => {
    const res = await apiClient.post('/complaints', payload);
    return res.data;
  },

  // Citizen submit complaint via voice/multilingual
  submitVoice: async (payload) => {
    const res = await apiClient.post('/complaints/voice', payload);
    return res.data;
  },

  // List complaints (citizens see their own, officers see their department)
  list: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.department_id) params.append('department_id', filters.department_id);
    const res = await apiClient.get(`/complaints?${params.toString()}`);
    return res.data;
  },

  // Basic complaint + media
  getById: async (id) => {
    const res = await apiClient.get(`/complaints/${id}`);
    return res.data;
  },

  // 360-degree full view for officer inspection
  getFullView: async (id) => {
    const res = await apiClient.get(`/complaints/${id}/full`);
    return res.data;
  },

  // Officer status update
  updateStatus: async (id, status) => {
    const res = await apiClient.put(`/complaints/${id}/status`, { status });
    return res.data;
  },

  // Citizen confirms resolution or reopens
  confirmResolution: async (id, confirmed, notes = '') => {
    const res = await apiClient.post(`/complaints/${id}/confirm-resolution`, { confirmed, notes });
    return res.data;
  },

  // Upload media file (multipart)
  uploadMedia: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`/complaints/${id}/media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Attach pre-hosted media URL
  addMedia: async (id, file_url, type) => {
    const res = await apiClient.post(`/complaints/${id}/media`, { file_url, type });
    return res.data;
  },

  // Officer translates and saves response note for citizen
  translateResponse: async (id, note, target_language) => {
    const res = await apiClient.post(`/complaints/${id}/translate-response`, { note, target_language });
    return res.data;
  },

  // Master issues list
  listMasterIssues: async () => {
    const res = await apiClient.get('/complaints/master-issues');
    return res.data;
  },

  // Get master issue cluster for a specific complaint
  getMasterIssueForComplaint: async (id) => {
    const res = await apiClient.get(`/complaints/${id}/master-issue`);
    return res.data;
  },

  // Refresh master issue cluster
  refreshMasterIssue: async (id) => {
    const res = await apiClient.post(`/complaints/${id}/master-issue/refresh`);
    return res.data;
  },

  // Duplicates list for a complaint
  getDuplicates: async (id) => {
    const res = await apiClient.get(`/complaints/${id}/duplicates`);
    return res.data;
  },

  // Mark a complaint as duplicate
  markDuplicate: async (id, matched_complaint_id, similarity_score) => {
    const res = await apiClient.post(`/complaints/${id}/duplicate`, { matched_complaint_id, similarity_score });
    return res.data;
  },

  // Pending Human-in-the-loop reviews list
  getPendingReviews: async () => {
    const res = await apiClient.get('/complaints/pending-reviews');
    return res.data;
  },

  // Submit officer human review
  addReview: async (id, payload) => {
    // payload: { action: 'APPROVE'|'MODIFY'|'REJECT'|'FLAG_FOR_REVIEW', notes, modification_reason, final_decision }
    const res = await apiClient.post(`/complaints/${id}/review`, payload);
    return res.data;
  },

  // Get review history
  getReviewHistory: async (id) => {
    const res = await apiClient.get(`/complaints/${id}/review-history`);
    return res.data;
  },

  // Get explainable AI factors
  getXaiExplanation: async (id) => {
    const res = await apiClient.get(`/complaints/${id}/xai`);
    return res.data;
  },

  // Get complaint audit trail
  getAuditTrail: async (id) => {
    const res = await apiClient.get(`/complaints/${id}/audit`);
    return res.data;
  },
};

/* ============================================================
   GIS / HOTSPOTS API
   ============================================================ */
export const gisAPI = {
  // Clustered hotspots
  getHotspots: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/gis/hotspots?${query}`);
    return res.data;
  },

  // Raw points for heatmap
  getHeatmapPoints: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/gis/points?${query}`);
    return res.data;
  },

  // Complaints nearby a coordinate
  getNearby: async (lat, lng, radius_meters = 500, limit = 20) => {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius_meters: String(radius_meters),
      limit: String(limit),
    });
    const res = await apiClient.get(`/gis/nearby?${params.toString()}`);
    return res.data;
  },
};

/* ============================================================
   SLA & ESCALATION API
   ============================================================ */
export const slaAPI = {
  getComplaintSla: async (complaintId) => {
    const res = await apiClient.get(`/sla/${complaintId}`);
    return res.data;
  },

  getEscalations: async (complaintId) => {
    const res = await apiClient.get(`/sla/${complaintId}/escalations`);
    return res.data;
  },

  // Manual trigger for escalation sweep
  checkEscalations: async () => {
    const res = await apiClient.post('/sla/check-escalations');
    return res.data;
  },

  // Set SLA deadline / priority on a complaint
  setSla: async (complaintId, payload) => {
    const res = await apiClient.post(`/complaints/${complaintId}/sla`, payload);
    return res.data;
  },
};

/* ============================================================
   AI SERVICE API
   ============================================================ */
export const aiAPI = {
  getHealth: async () => {
    const res = await apiClient.get('/ai/health');
    return res.data;
  },

  getJobStatus: async (complaintId) => {
    const res = await apiClient.get(`/ai/jobs/${complaintId}`);
    return res.data;
  },

  // Test / run standalone analysis
  analyze: async (payload) => {
    const res = await apiClient.post('/ai/analyze', payload);
    return res.data;
  },
};

/* ============================================================
   ANALYTICS & NOTIFICATIONS API
   ============================================================ */
export const analyticsAPI = {
  getOfficerAnalytics: async () => {
    const res = await apiClient.get('/analytics/officer-analytics');
    return res.data;
  },

  getNotifications: async () => {
    const res = await apiClient.get('/analytics/notifications');
    return res.data;
  },

  getTimeline: async (complaintId) => {
    const res = await apiClient.get(`/analytics/complaints/${complaintId}/timeline`);
    return res.data;
  },

  getAudit: async (complaintId) => {
    const res = await apiClient.get(`/analytics/complaints/${complaintId}/audit`);
    return res.data;
  },
};

export default apiClient;
