import { useState } from "react";
import { useComplaints } from "../context/useComplaints";
import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

const statuses = ["submitted", "in_progress", "resolved", "reopened", "closed"];

function OfficialDashboard() {
  const { user } = useAuth();
  const { complaints, updateComplaintStatus } = useComplaints();
  const [statusFilter, setStatusFilter] = useState("All");
  if (!user || user.role === "citizen") return <Navigate to="/" replace />;

  const visibleComplaints = complaints.filter((complaint) => statusFilter === "All" || complaint.status === statusFilter);
  const count = (status) => complaints.filter((complaint) => complaint.status === status).length;

  return (
    <main className="official-page">
      <header>
        <p className="eyebrow">JanSeva AI</p>
        <h1>Official Desk</h1>
        <p>Review citizen reports, inspect AI recommendations, and record accountable status updates.</p>
      </header>
      <section className="dashboard-stats" aria-label="Complaint summary">
        <strong>Total <span>{complaints.length}</span></strong>
        {statuses.map((status) => <strong key={status}>{status.replaceAll("_", " ")} <span>{count(status)}</span></strong>)}
      </section>
      <label htmlFor="status-filter">Filter by status</label>
      <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
        <option>All</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
      </select>
      <section className="official-list">
        {visibleComplaints.length === 0 ? <p>No complaints match this filter.</p> : visibleComplaints.map((complaint) => (
          <article className="official-complaint" key={complaint.id}>
            <div><span className="complaint-id">{complaint.id}</span><h2>{complaint.title}</h2><p>{complaint.description}</p><p><strong>Location:</strong> {complaint.location} · <strong>Category:</strong> {complaint.category}</p></div>
            <aside><p><strong>AI suggested category:</strong> {complaint.aiCategory || complaint.category}</p><p><strong>AI suggested priority:</strong> {complaint.aiPriority || "Pending"}</p><p><strong>AI summary:</strong> {complaint.aiSummary || "Pending processing"}</p><label htmlFor={`status-${complaint.id}`}>Official status</label><select id={`status-${complaint.id}`} value={complaint.status} onChange={(event) => updateComplaintStatus(complaint.id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></aside>
          </article>
        ))}
      </section>
    </main>
  );
}

export default OfficialDashboard;
