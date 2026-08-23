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
	getComplaints: async (token) => {
		const response = await request("/complaints", { headers: authHeaders(token) });
		return (response.complaints || []).map(normalizeComplaint);
	},
	createComplaint: async (data, token) => {
		const response = await request("/complaints", {
			method: "POST",
			headers: authHeaders(token),
			body: JSON.stringify({
				title: data.title,
				description: data.description,
				category: data.category,
				location: data.location,
			}),
		});
		return normalizeComplaint(response.complaint);
	},
};
