import { Link, useParams } from "react-router-dom";
import { useComplaints } from "../context/useComplaints";
import { useAuth } from "../context/useAuth";
import StatusTimeline from "../components/StatusTimeline";

function TrackComplaint() {
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
            <div className="track-page">
                <h1>Loading Complaint...</h1>
                <p>
                    Please wait while we load your complaint.
                </p>
            </div>
        );
    }

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

    return (
        <div className="track-page">

            <h1>Track Complaint</h1>

            <div className="complaint-summary">

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

                {complaint.updatedAt && (
                    <p>
                        <strong>Last updated:</strong>{" "}
                        {complaint.updatedAt}
                    </p>
                )}

            </div>

            <h2>Complaint Status</h2>

            <StatusTimeline
                status={complaint.status}
                statusHistory={complaint.statusHistory || []}
            />

            <Link
                to={`/complaint/${encodeURIComponent(complaint.id)}`}
                className="details-link"
            >
                View Complaint Details
            </Link>

        </div>
    );
}

export default TrackComplaint;