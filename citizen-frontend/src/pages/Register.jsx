import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        setError("");

        if (!formData.name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!formData.email.includes("@")) {
            setError("Please enter a valid email.");
            return;
        }

        if (formData.password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        const result = register(formData);
        if (!result.success) {
            setError(result.message);
            return;
        }

        navigate("/login");
    };

    return (
        <div className="auth-page">

            <h1>Create Account</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="register-name">Name</label>

                    <input
                        id="register-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label htmlFor="register-email">Email</label>

                    <input
                        id="register-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label htmlFor="register-password">Password</label>

                    <input
                        id="register-password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                    />
                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <button type="submit">
                    Register
                </button>

            </form>

            <p>
                Already have an account?{" "}
                <Link to="/login">
                    Login
                </Link>
            </p>

        </div>
    );
}

export default Register;