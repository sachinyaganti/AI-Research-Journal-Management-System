import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

export default function GoogleAuthButton({ mode = "signin" }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [error, setError] = useState("");

  const handleGoogleAuth = async (email, name) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google authentication failed");
      }

      login(data.token, data.user);

      // Navigate based on role
      if (data.user.role === "EDITOR" || data.user.role === "ADMIN") {
        navigate("/editor");
      } else if (data.user.role === "REVIEWER") {
        navigate("/reviewer");
      } else {
        navigate("/author");
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoGoogle = (presetEmail, presetName) => {
    handleGoogleAuth(presetEmail, presetName);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!googleEmail || !googleName) {
      setError("Please provide both email and full name");
      return;
    }
    handleGoogleAuth(googleEmail, googleName);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          background: "#ffffff",
          color: "#1e293b",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
          transition: "all 0.2s ease",
          fontFamily: "var(--font-sans)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          e.currentTarget.style.backgroundColor = "#f8fafc";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.08)";
          e.currentTarget.style.backgroundColor = "#ffffff";
        }}
      >
        {/* Google Multi-Color G Logo SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>
          {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
        </span>
      </button>

      {/* Google Sign-In Selection Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: "460px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h2 style={{ fontSize: "1.35rem", margin: 0 }}>
                Google Single Sign-On
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px" }}>
                Sign in with your Google account credentials
              </p>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            {/* Quick 1-Click Profiles for active development */}
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-dim)",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Fast Google Profiles:
              </span>
              <div style={{ display: "grid", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemoGoogle("sachin.scholar@gmail.com", "Dr. Sachin Yaganti")
                  }
                  disabled={loading}
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = "var(--primary)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-subtle)")
                  }
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      Dr. Sachin Yaganti
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      sachin.scholar@gmail.com
                    </div>
                  </div>
                  <span className="badge badge-submitted">Author</span>
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "16px 0",
                gap: "10px",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>
                Or Custom Google Account
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            </div>

            <form onSubmit={handleCustomSubmit} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.82rem" }}>Google Full Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Elena Rostova"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem" }}>Google Gmail Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="e.g. elena@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Authorize with Google"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
