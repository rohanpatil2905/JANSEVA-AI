import { Link, useParams } from "react-router-dom";
import { useComplaints } from "../context/ComplaintContext";
import { useAuth } from "../context/AuthContext";

function ComplaintDetails() {
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
            <div>
                <h1>Complaint Not Found</h1>

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

                <Link to={`/track/${complaint.id}`}>
                    Track Complaint
                </Link>

            </div>

        </div>
    );
}

export default ComplaintDetails;