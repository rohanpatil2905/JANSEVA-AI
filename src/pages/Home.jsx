import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-page">

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">

                    <h1>JanSeva AI</h1>

                    <h2>
                        AI-Powered Citizen Complaint Management
                    </h2>

                    <p>
                        Report civic issues easily, submit complaints in your
                        preferred language, and track their resolution.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/submit-complaint"
                            className="primary-button"
                        >
                            Submit Complaint
                        </Link>

                        <Link
                            to="/my-complaints"
                            className="secondary-button"
                        >
                            Track Complaint
                        </Link>

                    </div>

                </div>
            </section>


            {/* Features Section */}
            <section className="features-section">

                <h2>Citizen Services</h2>

                <div className="features-grid">

                    <div className="feature-card">
                        <h3>📝 Submit Complaint</h3>

                        <p>
                            Report civic problems such as road damage,
                            water supply issues, garbage and streetlight problems.
                        </p>

                        <Link to="/submit-complaint">
                            Report Now →
                        </Link>
                    </div>


                    <div className="feature-card">
                        <h3>🔍 Track Complaint</h3>

                        <p>
                            Track your complaint status and view updates
                            from the concerned department.
                        </p>

                        <Link to="/my-complaints">
                            View Complaints →
                        </Link>
                    </div>


                    <div className="feature-card">
                        <h3>🌐 Multiple Languages</h3>

                        <p>
                            Interact with the platform using your preferred
                            language.
                        </p>

                        <Link to="/language">
                            Select Language →
                        </Link>
                    </div>

                </div>

            </section>


            {/* How It Works */}
            <section className="how-section">

                <h2>How JanSeva AI Works</h2>

                <div className="steps">

                    <div className="step">
                        <span>1</span>
                        <h3>Report</h3>
                        <p>
                            Citizen submits a civic complaint.
                        </p>
                    </div>

                    <div className="step">
                        <span>2</span>
                        <h3>AI Analysis</h3>
                        <p>
                            AI helps categorize and process the complaint.
                        </p>
                    </div>

                    <div className="step">
                        <span>3</span>
                        <h3>Assignment</h3>
                        <p>
                            Complaint is forwarded to the appropriate department.
                        </p>
                    </div>

                    <div className="step">
                        <span>4</span>
                        <h3>Resolution</h3>
                        <p>
                            Citizen can track the complaint until resolution.
                        </p>
                    </div>

                </div>

            </section>

        </div>
    );
}

export default Home;