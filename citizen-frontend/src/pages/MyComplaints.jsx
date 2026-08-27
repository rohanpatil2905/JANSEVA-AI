import { Link } from "react-router-dom";
import ComplaintCard from "../components/ComplaintCard";
import { useLanguage } from "../context/useLanguage";
import { useComplaints } from "../context/useComplaints";
import { useAuth } from "../context/useAuth";

function MyComplaints() {
    const { getUserComplaints, complaints, loading } = useComplaints();
    const { user } = useAuth();
    const { t } = useLanguage();

    console.log("MY COMPLAINTS FILE LOADED");
    console.log("Logged-in user:", user);
    console.log("All complaints from context:", complaints);
    console.log("Loading:", loading);

    if (loading) {
        return (
            <div className="my-complaints-page">
                <h1>{t("nav.mine")}</h1>
                <p>Loading your complaints...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="my-complaints-page">
                <h1>{t("nav.mine")}</h1>
                <p>Please log in to view your complaints.</p>
                <Link to="/login">Login</Link>
            </div>
        );
    }

    const userComplaints = getUserComplaints(user.email, user.id);

    console.log("User ID:", user.id);
    console.log("Filtered complaints:", userComplaints);
    console.log("Filtered count:", userComplaints.length);

    return (
        <div className="my-complaints-page">
            <h1>{t("nav.mine")}</h1>

            {userComplaints.length === 0 ? (
                <div>
                    <p>{t("complaint.empty")}</p>

                    <Link to="/submit-complaint">
                        {t("complaint.first")}
                    </Link>
                </div>
            ) : (
                <div className="complaints-list">
                    {userComplaints.map((complaint) => (
                        <ComplaintCard
                            complaint={complaint}
                            key={complaint.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyComplaints;