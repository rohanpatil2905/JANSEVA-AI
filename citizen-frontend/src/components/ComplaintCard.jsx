import { Link } from "react-router-dom";

function ComplaintCard({ complaint = {} }) {
	const complaintId = complaint.id || "Not available";
	const title = complaint.title || "Untitled complaint";

	return (
		<article className="complaint-card">
			<header>
				<p className="complaint-id">{complaintId}</p>
				<h2>{title}</h2>
				<span className={`status-badge status-${(complaint.status || "unknown").toLowerCase().replaceAll(" ", "-")}`}>{complaint.status || "Not available"}</span>
			</header>

			<dl>
				<div>
					<dt>Category</dt>
					<dd>{complaint.category || "Not specified"}</dd>
				</div>
				<div>
					<dt>Status</dt>
					<dd>
						<strong aria-label={`Complaint status: ${complaint.status || "Not available"}`}>{complaint.status || "Not available"}</strong>
					</dd>
				</div>
				<div>
					<dt>Created date</dt>
					<dd>{complaint.createdAt || "Not available"}</dd>
				</div>
				<div>
					<dt>Location</dt>
					<dd>{complaint.location || "Not provided"}</dd>
				</div>
			</dl>

			{complaint.id ? (
				<Link to={`/complaint/${encodeURIComponent(complaint.id)}`}>
					View Details
				</Link>
			) : (
				<span aria-disabled="true">View Details unavailable</span>
			)}
		</article>
	);
}

export default ComplaintCard;
