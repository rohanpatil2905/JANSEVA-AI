import { Link } from "react-router-dom";
import ComplaintCard from "../components/ComplaintCard";
import { useLanguage } from "../context/useLanguage";
import { useComplaints } from "../context/useComplaints";
import { useAuth } from "../context/useAuth";

function MyComplaints() {
    const { getUserComplaints } = useComplaints();

    const { user } = useAuth();
    const { t } = useLanguage();

    const complaints = getUserComplaints(user.email);

    return (
        <div className="my-complaints-page">

            <h1>{t("nav.mine")}</h1>

            {complaints.length === 0 ? (
                <div>
                    <p>{t("complaint.empty")}</p>

                    <Link to="/submit-complaint">
                        {t("complaint.first")}
                    </Link>
                </div>
            ) : (
                <div className="complaints-list">

                    {complaints.map((complaint) => (
                        <ComplaintCard complaint={complaint} key={complaint.id} />
                    ))}

                </div>
            )}

        </div>
    );
}

export default MyComplaints;