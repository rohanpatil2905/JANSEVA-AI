// api.js — example of connecting plain JavaScript frontend to the JanSeva backend.
// Drop this into your frontend project and call these functions from your UI code.

const API_BASE = "http://localhost:5000/api";

// Keep the JWT in a plain JS variable while the page is open.
// (Don't use localStorage in sandboxed environments like Claude artifacts —
// but in a normal browser project outside Claude, localStorage is fine too.)
let authToken = null;

// ---------- AUTH ----------

async function registerUser({ name, email, phone, password, role }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  authToken = data.token;
  return data.user;
}

async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  authToken = data.token;
  return data.user;
}

// ---------- COMPLAINTS ----------

async function submitComplaint({ title, description, category_id, latitude, longitude }) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ title, description, category_id, latitude, longitude }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit complaint");
  return data.complaint;
}

async function getMyComplaints() {
  const res = await fetch(`${API_BASE}/complaints`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch complaints");
  return data.complaints;
}

async function getComplaintDetails(complaintId) {
  const res = await fetch(`${API_BASE}/complaints/${complaintId}/full`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch complaint details");
  return data; // { complaint, ai_prediction, severity, authenticity, routing, ... }
}

async function updateComplaintStatus(complaintId, status) {
  const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update status");
  return data.complaint;
}

// ---------- EXAMPLE USAGE ----------
//
// (async () => {
//   await loginUser({ email: "citizen@test.com", password: "pass123" });
//   const complaint = await submitComplaint({
//     title: "No water supply",
//     description: "No water for 3 days",
//   });
//   console.log("Created:", complaint);
//
//   const myComplaints = await getMyComplaints();
//   console.log("My complaints:", myComplaints);
// })();

export {
  registerUser,
  loginUser,
  submitComplaint,
  getMyComplaints,
  getComplaintDetails,
  updateComplaintStatus,
};
