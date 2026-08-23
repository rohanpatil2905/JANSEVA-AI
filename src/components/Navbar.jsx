import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="site-nav">
            <div className="nav-inner">
                <div className="brand-mark">
                    <Link to="/">JanSeva AI</Link>
                </div>

                <div className="nav-links">
                    <Link to="/">Home</Link>

                    <Link to="/submit-complaint">
                        Submit Complaint
                    </Link>

                    <Link to="/my-complaints">
                        My Complaints
                    </Link>

                    <Link to="/login">
                        Login
                    </Link>

                    <Link to="/register">
                        Register
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;