import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function ReviewerDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviewer-assignments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load assignments");
      }

      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssignments();
    }
  }, [token]);

  const handleStartReview = async (assignmentId) => {
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviewer-assignments/${assignmentId}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start review");
      }

      await fetchAssignments();
    } catch (err) {
      setError(err.message || "Failed to start review");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ASSIGNED":
        return <span className="badge badge-submitted">ASSIGNED</span>;
      case "IN_REVIEW":
        return <span className="badge badge-under-review">IN REVIEW</span>;
      case "COMPLETED":
        return <span className="badge badge-accepted">COMPLETED ✓</span>;
      case "DECLINED":
        return <span className="badge badge-rejected">DECLINED</span>;
      default:
        return <span className="badge badge-submitted">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px", textAlign: "left" }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          padding: "28px 32px",
          marginBottom: "32px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span className="badge badge-under-review" style={{ fontSize: "0.75rem" }}>
              PEER REVIEWER PORTAL
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Reviewer Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "0.95rem" }}>
            Reviewer: <strong style={{ color: "#fff" }}>{user?.fullName}</strong> ({user?.email})
          </p>
        </div>

        <div>
          <button onClick={fetchAssignments} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
            ↻ Refresh Assignments
          </button>
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            borderColor: "rgba(239, 68, 68, 0.4)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#fca5a5",
            padding: "16px 20px",
            marginBottom: "24px"
          }}
        >
          {error}
        </div>
      )}

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
            My Assigned Manuscripts ({assignments.length})
          </h2>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
            <p style={{ color: "var(--text-secondary)" }}>Loading assignments...</p>
          </div>
        )}

        {!loading && assignments.length === 0 && (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "60px 24px",
              color: "var(--text-secondary)"
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📬</div>
            <h3 style={{ color: "var(--text-primary)", marginBottom: "6px" }}>
              No Active Assignments
            </h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              You do not have any pending review invitations at this time.
            </p>
          </div>
        )}

        {!loading && assignments.length > 0 && (
          <div style={{ display: "grid", gap: "20px" }}>
            {assignments.map((assignment) => (
              <article
                key={assignment.id}
                className="card"
                style={{
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px"
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    {getStatusBadge(assignment.status)}
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Assignment #{assignment.id}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <a
                      href={`${API_BASE_URL}/api/manuscripts/${assignment.manuscriptId}/pdf${token ? `?token=${encodeURIComponent(token)}` : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: "6px 14px", fontSize: "0.82rem", textDecoration: "none" }}
                    >
                      📄 Download Manuscript PDF
                    </a>
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--text-primary)",
                    lineHeight: 1.35
                  }}
                >
                  {assignment.manuscriptTitle}
                </h3>

                {/* Info row */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    flexWrap: "wrap",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    background: "rgba(255, 255, 255, 0.02)",
                    padding: "12px 16px",
                    borderRadius: "8px"
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Manuscript ID:</strong>{" "}
                    #{assignment.manuscriptId}
                  </div>
                  {assignment.assignedAt && (
                    <div>
                      <strong style={{ color: "var(--text-primary)" }}>Assigned Date:</strong>{" "}
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Due Date:</strong>{" "}
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "Standard (14 Days)"}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "12px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  {assignment.status === "ASSIGNED" && (
                    <button
                      onClick={() => handleStartReview(assignment.id)}
                      className="btn btn-primary"
                      style={{ padding: "8px 20px" }}
                    >
                      Start Review Evaluation →
                    </button>
                  )}

                  {assignment.status === "IN_REVIEW" && (
                    <button
                      onClick={() => navigate(`/reviewer/assignments/${assignment.id}/review`)}
                      className="btn btn-primary"
                      style={{ padding: "8px 20px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
                    >
                      ✍ Submit Completed Review
                    </button>
                  )}

                  {assignment.status === "COMPLETED" && (
                    <span style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: 600 }}>
                      ✓ Review has been submitted to editors
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ReviewerDashboard;