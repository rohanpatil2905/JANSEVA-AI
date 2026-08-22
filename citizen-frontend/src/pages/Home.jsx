import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-page">

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">

                    <p className="eyebrow">Your voice. Your neighbourhood. Your city.</p>
                    <h1>Small reports can create <em>big civic change.</em></h1>

                    <p className="hero-lede">JanSeva AI helps you report local issues in your language, understand what happens next, and stay informed until your complaint is resolved.</p>

                    <div className="hero-buttons">

                        <Link
                            to="/submit-complaint"
                            className="primary-button"
                        >
                            Report an issue
                        </Link>

                        <Link
                            to="/my-complaints"
                            className="secondary-button"
                        >
                            See my complaints
                        </Link>

                    </div>

                </div>
            </section>


            {/* Features Section */}
            <section className="features-section">

                <div className="section-heading"><p className="eyebrow">Made for real life</p><h2>Everything you need to be heard</h2><p>One clear place to raise a concern and follow it through.</p></div>

                <div className="features-grid">

                    <div className="feature-card">
                        <span className="feature-number">01</span><h3>Report in minutes</h3>

                        <p>
                            Report civic problems such as road damage,
                            water supply issues, garbage and streetlight problems.
                        </p>

                        <Link to="/submit-complaint">
                            Report Now →
                        </Link>
                    </div>


                    <div className="feature-card">
                        <span className="feature-number">02</span><h3>Follow every update</h3>

                        <p>
                            Track your complaint status and view updates
                            from the concerned department.
                        </p>

                        <Link to="/my-complaints">
                            View Complaints →
                        </Link>
                    </div>


                    <div className="feature-card">
                        <span className="feature-number">03</span><h3>Use your language</h3>

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

                <div className="section-heading"><p className="eyebrow">A transparent process</p><h2>From your words to meaningful action</h2></div>

                <div className="steps">

                    <div className="step">
                        <span>1</span>
                        <h3>Describe</h3>
                        <p>
                            Citizen submits a civic complaint.
                        </p>
                    </div>

                    <div className="step">
                        <span>2</span>
                        <h3>Understand</h3>
                        <p>
                            AI helps categorize and process the complaint.
                        </p>
                    </div>

                    <div className="step">
                        <span>3</span>
                        <h3>Route</h3>
                        <p>
                            Complaint is forwarded to the appropriate department.
                        </p>
                    </div>

                    <div className="step">
                        <span>4</span>
                        <h3>Resolve</h3>
                        <p>
                            Citizen can track the complaint until resolution.
                        </p>
                    </div>

                </div>

            </section>

            <section className="ai-section">
                <div><p className="eyebrow">Human-led, AI-assisted</p><h2>Clarity for citizens. Better context for officials.</h2><p>JanSeva AI can suggest a category, department, priority, and short summary from your complaint. Suggestions remain reviewable, while your original words stay exactly as you wrote them.</p></div>
                <div className="ai-list"><span>Language understanding</span><span>Category suggestion</span><span>Department routing</span><span>Priority recommendation</span></div>
            </section>

        </div>
    );
}

export default Home;