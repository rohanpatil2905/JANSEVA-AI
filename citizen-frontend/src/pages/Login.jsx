import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        const result = login(email, password);

        if (!result.success) {
            setError(result.message);
            return;
        }

        navigate(location.state?.from?.pathname || "/", { replace: true });
    };

    return (
        <div className="auth-page">

            <h1>Citizen Login</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="login-email">Email</label>

                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label htmlFor="login-password">Password</label>

                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        placeholder="Enter your password"
                    />
                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <button type="submit">
                    Login
                </button>

            </form>

            <p>
                Don't have an account?{" "}
                <Link to="/register">
                    Register
                </Link>
            </p>

        </div>
    );
}

export default Login;