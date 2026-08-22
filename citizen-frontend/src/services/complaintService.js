import { request } from "./api";

const authHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {};

export const complaintService = {
  getComplaints: (token) => request("/complaints", { headers: authHeaders(token) }),
  getComplaintById: (id, token) => request(`/complaints/${encodeURIComponent(id)}`, { headers: authHeaders(token) }),
  createComplaint: (data, token) => request("/complaints", { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) }),
  updateComplaintStatus: (id, status, token) => request(`/complaints/${encodeURIComponent(id)}/status`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ status }) }),
};
