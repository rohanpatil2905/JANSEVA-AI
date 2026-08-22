import { Link, useParams } from "react-router-dom";
import { useComplaints } from "../context/useComplaints";
import { useAuth } from "../context/useAuth";

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

                {complaint.updatedAt && <p><strong>Last updated:</strong>{" "}{complaint.updatedAt}</p>}

                {(complaint.aiCategory || complaint.aiDepartment || complaint.aiPriority || complaint.aiSummary) && (
                    <section className="ai-recommendation" aria-labelledby="ai-heading">
                        <p className="eyebrow">AI assistance</p>
                        <h2 id="ai-heading">Suggestions for review</h2>
                        <p>These recommendations help organize the complaint and are not final decisions.</p>
                        {complaint.aiCategory && <p><strong>Suggested category:</strong> {complaint.aiCategory}</p>}
                        {complaint.aiDepartment && <p><strong>Suggested department:</strong> {complaint.aiDepartment}</p>}
                        {complaint.aiPriority && <p><strong>Suggested priority:</strong> {complaint.aiPriority}</p>}
                        {complaint.aiSummary && <p><strong>Summary:</strong> {complaint.aiSummary}</p>}
                    </section>
                )}

                <Link to={`/track/${complaint.id}`}>
                    Track Complaint
                </Link>

            </div>

        </div>
    );
}

export default ComplaintDetails;