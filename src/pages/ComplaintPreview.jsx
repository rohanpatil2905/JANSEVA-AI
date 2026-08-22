import { useLocation, useNavigate } from "react-router-dom";
import { useComplaints } from "../context/ComplaintContext";
import { useAuth } from "../context/AuthContext";

function ComplaintPreview() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { addComplaint } = useComplaints();

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

    const handleSubmit = () => {
        const complaintId =
            "JS-" + Math.floor(1000 + Math.random() * 9000);

        const newComplaint = {
            id: complaintId,
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            location: complaint.location,
            image: complaint.image
                ? complaint.image.name
                : null,
            status: "Submitted",
            createdAt: new Date().toLocaleDateString(),
            userEmail: user.email,
        };

        addComplaint(newComplaint);

        alert(
            `Complaint submitted successfully!\nComplaint ID: ${complaintId}`
        );

        navigate("/my-complaints");
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

                    <button onClick={handleSubmit}>
                        Submit Complaint
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ComplaintPreview;