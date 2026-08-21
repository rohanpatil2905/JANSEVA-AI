import { Link } from "react-router-dom";
import { useComplaints } from "../context/ComplaintContext";
import { useAuth } from "../context/AuthContext";

function MyComplaints() {
    const { getUserComplaints } = useComplaints();

    const { user } = useAuth();

    const complaints = getUserComplaints(user.email);

    return (
        <div className="my-complaints-page">

            <h1>My Complaints</h1>

            {complaints.length === 0 ? (
                <div>
                    <p>You have not submitted any complaints yet.</p>

                    <Link to="/submit-complaint">
                        Submit Your First Complaint
                    </Link>
                </div>
            ) : (
                <div className="complaints-list">

                    {complaints.map((complaint) => (
                        <div
                            className="complaint-card"
                            key={complaint.id}
                        >

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
                                <strong>Status:</strong>{" "}
                                {complaint.status}
                            </p>

                            <p>
                                <strong>Submitted:</strong>{" "}
                                {complaint.createdAt}
                            </p>

                            <Link
                                to={`/complaint/${complaint.id}`}
                            >
                                View Details
                            </Link>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default MyComplaints;