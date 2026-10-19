import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://research-journal-backend-docker.onrender.com";

function EditorDecisionPage() {
  const { manuscriptId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [manuscript, setManuscript] = useState(null);
  const [decision, setDecision] = useState("ACCEPTED");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchManuscript = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/manuscripts/${manuscriptId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setManuscript(data);
        }
      } catch (e) {
        console.error("Failed to load manuscript details:", e);
      }
    };
    if (token) fetchManuscript();
  }, [manuscriptId, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if ((decision === "REVISION_REQUIRED" || decision === "REJECTED") && !comments.trim()) {
      setError(`Editorial comments are mandatory when issuing ${decision.replaceAll("_", " ")}.`);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/manuscripts/${manuscriptId}/decision`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            decision,
            comments: comments.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit editor decision");
      }

      setSuccess(`Decision "${data.decision}" successfully recorded! Redirecting...`);
      setTimeout(() => {
        navigate("/editor");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to submit editor decision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 24px", textAlign: "left" }}>
      <button
        type="button"
        onClick={() => navigate("/editor")}
        className="btn btn-secondary"
        style={{ marginBottom: "20px", fontSize: "0.85rem" }}
      >
        ← Back to Editor Dashboard
      </button>

      <div className="card" style={{ padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span className="badge badge-revision" style={{ fontSize: "0.75rem" }}>
            FORMAL EDITORIAL RECORD
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Manuscript ID #{manuscriptId}
          </span>
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
          Editorial Decision Letter
        </h1>

        {manuscript && (
          <div
            style={{
              padding: "16px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              marginBottom: "24px"
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", color: "var(--text-primary)" }}>
              {manuscript.title}
            </h3>
            <p style={{ margin: "0 0 6px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Author: <strong>{manuscript.authorName}</strong> ({manuscript.authorEmail})
            </p>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Category: {manuscript.category} | Current Status: {manuscript.status}
            </p>
          </div>
        )}

        {error && (
          <div
            className="card"
            style={{
              borderColor: "rgba(239, 68, 68, 0.4)",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#fca5a5",
              padding: "14px 18px",
              marginBottom: "20px",
              fontSize: "0.9rem"
            }}
          >
            ✕ {error}
          </div>
        )}

        {success && (
          <div
            className="card"
            style={{
              borderColor: "rgba(16, 185, 129, 0.4)",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#6ee7b7",
              padding: "14px 18px",
              marginBottom: "20px",
              fontSize: "0.9rem"
            }}
          >
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label htmlFor="decision" style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>
              Editorial Decision:
            </label>
            <select
              id="decision"
              className="form-select"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              <option value="ACCEPTED">ACCEPTED (Ready for open-access publication)</option>
              <option value="REVISION_REQUIRED">REVISION_REQUIRED (Author must address critiques)</option>
              <option value="REJECTED">REJECTED (Submission declined)</option>
            </select>
          </div>

          <div>
            <label htmlFor="comments" style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "8px" }}>
              Decision Comments & Revision Guidance:{" "}
              {(decision === "REVISION_REQUIRED" || decision === "REJECTED") && (
                <span style={{ color: "#f87171" }}>* Mandatory</span>
              )}
            </label>
            <textarea
              id="comments"
              className="form-input"
              rows={7}
              placeholder={
                decision === "REVISION_REQUIRED"
                  ? "Detail the mandatory revisions, methodology clarifications, or reviewer questions the author must address in their next draft..."
                  : decision === "REJECTED"
                    ? "Provide the scholarly rationale and key reasons for rejecting this submission..."
                    : "Enter any congratulations, final camera-ready requirements, or editorial remarks for the accepted author (optional)..."
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => navigate("/editor")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                background:
                  decision === "ACCEPTED"
                    ? "#10b981"
                    : decision === "REJECTED"
                      ? "#ef4444"
                      : "#f59e0b"
              }}
            >
              {submitting ? "Submitting..." : `Record Decision: ${decision.replaceAll("_", " ")}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditorDecisionPage;