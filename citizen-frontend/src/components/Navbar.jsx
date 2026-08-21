import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <div>
                <Link to="/">JanSeva AI</Link>
            </div>

            <div>
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
        </nav>
    );
}

export default Navbar;