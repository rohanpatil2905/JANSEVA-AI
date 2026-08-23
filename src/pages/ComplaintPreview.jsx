import { useLocation, useNavigate } from "react-router-dom";
import { useComplaints } from "../context/ComplaintContext";
import { useAuth } from "../context/AuthContext";

function ComplaintPreview() {
    const location = useLocation();
    const navigate = useNavigate();
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

    const handleSubmit = async () => {
        try {
            const savedComplaint = await addComplaint(complaint);
            alert(`Complaint submitted successfully!\nComplaint ID: ${savedComplaint.id}`);
            navigate("/my-complaints");
        } catch (error) {
            alert(error.message);
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

                    <button onClick={handleSubmit}>
                        Submit Complaint
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ComplaintPreview;