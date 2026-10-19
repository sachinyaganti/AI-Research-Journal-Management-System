import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://research-journal-backend-docker.onrender.com";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: "AUTHOR",
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.detail ||
          (typeof data === "string" ? data : "") ||
          `Registration failed(HTTP ${response.status}).`
        );
      }

      // Sign in automatically after successful registration.
      const loginResponse = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const loginData = await loginResponse.json().catch(() => ({}));

      if (!loginResponse.ok) {
        navigate("/login", {
          state: {
            message:
              "Account created successfully. Please sign in with your new credentials.",
          },
        });
        return;
      }

      login(loginData);
      navigate("/author");
    } catch (err) {
      setError(
        err.message ||
        "Unable to register. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 75px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "36px 32px",
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          textAlign: "left",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(236, 72, 153, 0.35)",
              marginBottom: "12px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>

          <h1 style={{ fontSize: "1.75rem", margin: "0 0 6px" }}>
            Create an Account
          </h1>

          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Join as an author to submit and track your research papers
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <GoogleAuthButton mode="signup" />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "20px 0",
            gap: "12px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--border-subtle)",
            }}
          />

          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Or register with email
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--border-subtle)",
            }}
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: "14px" }}
        >
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="input"
              placeholder="e.g. Alex Mercer"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="e.g. alex@university.edu"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
            }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Author Account"}
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "0.88rem",
            color: "var(--text-muted)",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ fontWeight: 600, color: "#a5b4fc" }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
