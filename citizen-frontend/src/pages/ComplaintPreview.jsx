import { useLocation, useNavigate } from "react-router-dom";
import { useComplaints } from "../context/useComplaints";
import { useAuth } from "../context/useAuth";
import { useState } from "react";

function ComplaintPreview() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { addComplaint } = useComplaints();
    const [submitting, setSubmitting] = useState(false);

    const complaint = location.state;

    if (!complaint) {
        return (
            <div>
                <h1>No Complaint Data Found</h1>

                <button
                    onClick={() => navigate("/submit-complaint")}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        const newComplaint = {
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            location: complaint.location,
            image: complaint.image
                ? complaint.image.name
                : null,
            status: "Submitted",
            userEmail: user.email.toLowerCase(),
        };

        try {
            await addComplaint(newComplaint);
            navigate("/my-complaints");
        } catch (error) {
            setSubmitting(false);
            window.alert(error.message);
        }
    };

    return (
        <div className="preview-page">

            <h1>Review Your Complaint</h1>

            <div className="preview-card">

                <h2>{complaint.title}</h2>

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

                {complaint.image && (
                    <p>
                        <strong>Image:</strong>{" "}
                        {complaint.image.name}
                    </p>
                )}

                <div className="preview-buttons">

                    <button
                        onClick={() =>
                            navigate("/submit-complaint")
                        }
                    >
                        Edit
                    </button>

                    <button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Complaint"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ComplaintPreview;