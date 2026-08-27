import { Link, useParams } from "react-router-dom";
import { useComplaints } from "../context/useComplaints";
import { useAuth } from "../context/useAuth";

function ComplaintDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const { complaints, loading } = useComplaints();

    const complaint = complaints.find((item) => {
        if (String(item.id) !== String(id)) {
            return false;
        }

        // Backend API complaints use citizen_id
        if (item.citizen_id && user?.id) {
            return String(item.citizen_id) === String(user.id);
        }

        // Backward compatibility with old frontend/local complaints
        if (item.userId && user?.id) {
            return String(item.userId) === String(user.id);
        }

        if (item.userEmail && user?.email) {
            return (
                String(item.userEmail).toLowerCase() ===
                String(user.email).toLowerCase()
            );
        }

        return false;
    });

    if (loading) {
        return (
            <div className="complaint-details">
                <h1>Loading Complaint...</h1>
                <p>Please wait while we load your complaint.</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="complaint-details">
                <h1>Complaint Not Found</h1>

                <p>
                    We could not find this complaint or you may not
                    have permission to view it.
                </p>

                <Link to="/my-complaints">
                    Back to My Complaints
                </Link>
            </div>
        );
    }

    return (
        <div className="complaint-details">
            <h1>Complaint Details</h1>

            <div className="complaint-card">
                <h2>{complaint.title}</h2>

                <p>
                    <strong>Complaint ID:</strong>{" "}
                    {complaint.id}
                </p>

                {complaint.tracking_code && (
                    <p>
                        <strong>Tracking Code:</strong>{" "}
                        {complaint.tracking_code}
                    </p>
                )}

                <p>
                    <strong>Description:</strong>
                    <br />
                    {complaint.description}
                </p>

                <p>
                    <strong>Category:</strong>{" "}
                    {complaint.category}
                </p>

                <p>
                    <strong>Location:</strong>{" "}
                    {complaint.location}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    {complaint.status}
                </p>

                <p>
                    <strong>Submitted:</strong>{" "}
                    {complaint.createdAt}
                </p>

                {complaint.updatedAt && (
                    <p>
                        <strong>Last updated:</strong>{" "}
                        {complaint.updatedAt}
                    </p>
                )}

                {(complaint.aiCategory ||
                    complaint.aiDepartment ||
                    complaint.aiPriority ||
                    complaint.aiSummary) && (
                    <section
                        className="ai-recommendation"
                        aria-labelledby="ai-heading"
                    >
                        <p className="eyebrow">
                            AI assistance
                        </p>

                        <h2 id="ai-heading">
                            Suggestions for review
                        </h2>

                        <p>
                            These recommendations help organize
                            the complaint and are not final
                            decisions.
                        </p>

                        {complaint.aiCategory && (
                            <p>
                                <strong>
                                    Suggested category:
                                </strong>{" "}
                                {complaint.aiCategory}
                            </p>
                        )}

                        {complaint.aiDepartment && (
                            <p>
                                <strong>
                                    Suggested department:
                                </strong>{" "}
                                {complaint.aiDepartment}
                            </p>
                        )}

                        {complaint.aiPriority && (
                            <p>
                                <strong>
                                    Suggested priority:
                                </strong>{" "}
                                {complaint.aiPriority}
                            </p>
                        )}

                        {complaint.aiSummary && (
                            <p>
                                <strong>Summary:</strong>{" "}
                                {complaint.aiSummary}
                            </p>
                        )}
                    </section>
                )}

                <Link to={`/track/${encodeURIComponent(complaint.id)}`}>
                    Track Complaint
                </Link>
            </div>
        </div>
    );
}

export default ComplaintDetails;