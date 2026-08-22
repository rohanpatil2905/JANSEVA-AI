const statuses = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];

function StatusTimeline({ status, statusHistory = [] }) {
	const currentIndex = statuses.indexOf(status);
	const historyByStatus = new Map(statusHistory.map((item) => [item.status, item.timestamp]));

	return (
		<div className="status-timeline" aria-label="Complaint status timeline">
			{statuses.map((item, index) => {
				const completed = index <= currentIndex;
				return (
					<div className={`timeline-item ${completed ? "completed" : ""} ${item === status ? "current" : ""}`} key={item}>
						<div className="timeline-number">{index + 1}</div>
						<div className="timeline-content">
							<h3>{item} {item === status && <span className="current-label">Current</span>}</h3>
							<p>{historyByStatus.get(item) ? new Date(historyByStatus.get(item)).toLocaleString() : completed ? "Completed" : "Awaiting update"}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default StatusTimeline;
