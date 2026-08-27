const statuses = ["submitted", "in_progress", "resolved", "reopened", "closed"];

function normalizeStatus(status) {
    if (!status) return "";

    return String(status)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
}

function StatusTimeline({ status, statusHistory = [] }) {
    const normalizedStatus = normalizeStatus(status);

    const currentIndex = statuses.indexOf(normalizedStatus);

    const historyByStatus = new Map(
        statusHistory.map((item) => [
            normalizeStatus(item.status),
            item.timestamp,
        ])
    );

    return (
        <div
            className="status-timeline"
            aria-label="Complaint status timeline"
        >
            {statuses.map((item, index) => {
                const completed =
                    currentIndex >= 0 && index <= currentIndex;

                const current = item === normalizedStatus;

                return (
                    <div
                        className={`timeline-item ${
                            completed ? "completed" : ""
                        } ${current ? "current" : ""}`}
                        key={item}
                    >
                        <div className="timeline-number">
                            {index + 1}
                        </div>

                        <div className="timeline-content">
                            <h3>
                                {item.replaceAll("_", " ")}
                                {current && (
                                    <span className="current-label">
                                        Current
                                    </span>
                                )}
                            </h3>

                            <p>
                                {historyByStatus.get(item)
                                    ? new Date(
                                          historyByStatus.get(item)
                                      ).toLocaleString()
                                    : completed
                                    ? "Completed"
                                    : "Awaiting update"}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default StatusTimeline;