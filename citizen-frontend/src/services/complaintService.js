import { request } from "./api";

const authHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {};
const normalizeComplaint = (complaint = {}) => ({
  ...complaint,
  id: String(complaint.id ?? complaint.complaint_id ?? ""),
  category: complaint.category || complaint.category_name || complaint.category_id || "Not specified",
  location: complaint.location || (complaint.latitude != null && complaint.longitude != null ? `${complaint.latitude}, ${complaint.longitude}` : "Not provided"),
  statusHistory: complaint.statusHistory || complaint.status_history || [],
  createdAt: complaint.createdAt || complaint.created_at,
  updatedAt: complaint.updatedAt || complaint.updated_at,
});

export const complaintService = {
  getComplaints: async (token) => ((await request("/complaints", { headers: authHeaders(token) })).complaints || []).map(normalizeComplaint),
  getComplaintById: async (id, token) => normalizeComplaint((await request(`/complaints/${encodeURIComponent(id)}`, { headers: authHeaders(token) })).complaint),
  createComplaint: async (data, token) => normalizeComplaint((await request("/complaints", { method: "POST", headers: authHeaders(token), body: JSON.stringify({
    title: data.title,
    description: data.description,
    category: data.category,
    location: data.location,
    category_id: data.categoryId || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
  }) })).complaint),
  updateComplaintStatus: async (id, status, token) => normalizeComplaint((await request(`/complaints/${encodeURIComponent(id)}/status`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ status }) })).complaint),
};
