import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password"
                );
            }

            login(data);

            if (data.user.role === "AUTHOR") {
                navigate("/author");
            } else if (data.user.role === "REVIEWER") {
                navigate("/reviewer");
            } else if (data.user.role === "EDITOR") {
                navigate("/editor");
            } else if (data.user.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <br />
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="password">Password</label>
                    <br />
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default LoginPage;