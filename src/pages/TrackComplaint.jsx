import { Link, useParams } from "react-router-dom";
import { useComplaints } from "../context/ComplaintContext";
import { useAuth } from "../context/AuthContext";

function TrackComplaint() {
    const { id } = useParams();
    const { user } = useAuth();

    const { complaints } = useComplaints();

    const complaint = complaints.find(
        (item) =>
            item.id === id &&
            item.userEmail === user.email
    );

    if (!complaint) {
        return (
            <div className="track-page">
                <h1>Complaint Not Found</h1>

                <p>
                    We could not find a complaint with ID:
                    <strong> {id}</strong>
                </p>

                <Link to="/my-complaints">
                    Back to My Complaints
                </Link>
            </div>
        );
    }

    const statuses = [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
    ];

    const currentStatusIndex =
        statuses.indexOf(complaint.status);

    return (
        <div className="track-page">

            <h1>Track Complaint</h1>

            <div className="complaint-summary">

                <h2>{complaint.title}</h2>

                <p>
                    <strong>Complaint ID:</strong>{" "}
                    {complaint.id}
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
                    <strong>Current Status:</strong>{" "}
                    {complaint.status}
                </p>

            </div>


            <div className="status-timeline">

                <h2>Complaint Status</h2>

                {statuses.map((status, index) => {

                    const isCompleted =
                        index <= currentStatusIndex;

                    return (
                        <div
                            className={`timeline-item ${isCompleted
                                ? "completed"
                                : ""
                                }`}
                            key={status}
                        >

                            <div className="timeline-number">
                                {index + 1}
                            </div>

                            <div className="timeline-content">

                                <h3>{status}</h3>

                                {index === 0 && (
                                    <p>
                                        Your complaint has been successfully
                                        submitted.
                                    </p>
                                )}

                                {index === 1 && (
                                    <p>
                                        The complaint is being reviewed by
                                        the concerned department.
                                    </p>
                                )}

                                {index === 2 && (
                                    <p>
                                        The complaint has been assigned to
                                        the appropriate department.
                                    </p>
                                )}

                                {index === 3 && (
                                    <p>
                                        Work is currently being carried out
                                        to resolve the issue.
                                    </p>
                                )}

                                {index === 4 && (
                                    <p>
                                        The complaint has been marked as
                                        resolved.
                                    </p>
                                )}

                            </div>

                        </div>
                    );
                })}

            </div>


            <Link
                to={`/complaint/${complaint.id}`}
                className="details-link"
            >
                View Complaint Details
            </Link>

        </div>
    );
}

export default TrackComplaint;