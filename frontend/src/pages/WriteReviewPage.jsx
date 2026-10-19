import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://research-journal-backend-docker.onrender.com";

function WriteReviewPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [assignment, setAssignment] = useState(null);

  const [rating, setRating] = useState(4);
  const [clarityRating, setClarityRating] = useState(4);
  const [originalityRating, setOriginalityRating] = useState(4);
  const [methodologyRating, setMethodologyRating] = useState(4);
  const [recommendation, setRecommendation] = useState("MINOR_REVISION");

  const [comments, setComments] = useState("");
  const [commentsToAuthor, setCommentsToAuthor] = useState("");
  const [confidentialCommentsToEditor, setConfidentialCommentsToEditor] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/reviewer-assignments/${assignmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load assignment");
        }

        setAssignment(data);
      } catch (err) {
        setError(err.message || "Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAssignment();
    }
  }, [assignmentId, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!comments.trim()) {
      setError("Overall review comments are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviewer-assignments/${assignmentId}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rating: Number(rating),
            clarityRating: Number(clarityRating),
            originalityRating: Number(originalityRating),
            methodologyRating: Number(methodologyRating),
            recommendation,
            comments: comments.trim(),
            commentsToAuthor: commentsToAuthor.trim(),
            confidentialCommentsToEditor: confidentialCommentsToEditor.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      navigate("/reviewer");
    } catch (err) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
        <p style={{ color: "var(--text-secondary)" }}>Loading assignment dossier...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 24px", textAlign: "left" }}>
      <button
        type="button"
        onClick={() => navigate("/reviewer")}
        className="btn btn-secondary"
        style={{ marginBottom: "20px", fontSize: "0.85rem" }}
      >
        ← Back to Reviewer Dashboard
      </button>

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

      {assignment && (
        <div className="card" style={{ padding: "32px" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "20px",
              marginBottom: "24px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="badge badge-under-review" style={{ fontSize: "0.75rem" }}>
                  FORMAL PEER REVIEW
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Assignment #{assignment.id}
                </span>
              </div>
              <h1 style={{ fontSize: "1.7rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                {assignment.manuscriptTitle}
              </h1>
            </div>

            <a
              href={`${API_BASE_URL}/api/manuscripts/${assignment.manuscriptId}/pdf${token ? `?token=${encodeURIComponent(token)}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: "0.85rem", textDecoration: "none" }}
            >
              📄 Read Manuscript PDF
            </a>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Top row: Overall Rating & Recommendation */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                  Overall Assessment Rating:
                </label>
                <select
                  className="form-select"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="5">5 - Excellent (Outstanding scientific contribution)</option>
                  <option value="4">4 - Good (Strong, minor enhancements needed)</option>
                  <option value="3">3 - Average (Acceptable with revisions)</option>
                  <option value="2">2 - Below Average (Major flaws in methodology/analysis)</option>
                  <option value="1">1 - Poor (Unsuitable for publication)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.88rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                  Editorial Recommendation:
                </label>
                <select
                  className="form-select"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                >
                  <option value="ACCEPT">ACCEPT (Publish as is / camera-ready)</option>
                  <option value="MINOR_REVISION">MINOR REVISION (Small clarifications needed)</option>
                  <option value="MAJOR_REVISION">MAJOR REVISION (Substantial rework required)</option>
                  <option value="REJECT">REJECT (Declined)</option>
                </select>
              </div>
            </div>

            {/* Criteria Scores Grid */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.06)"
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--accent-primary)" }}>
                Multi-Criteria Breakdown (1-5 Scale)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                    Clarity & Structure (1-5):
                  </label>
                  <select
                    className="form-select"
                    value={clarityRating}
                    onChange={(e) => setClarityRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Stars</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                    Novelty & Originality (1-5):
                  </label>
                  <select
                    className="form-select"
                    value={originalityRating}
                    onChange={(e) => setOriginalityRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Stars</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                    Methodology & Rigor (1-5):
                  </label>
                  <select
                    className="form-select"
                    value={methodologyRating}
                    onChange={(e) => setMethodologyRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Stars</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comments to Author */}
            <div>
              <label style={{ fontSize: "0.88rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                Constructive Comments to the Author(s):
              </label>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 8px" }}>
                These comments will be blinded and shared with the author to guide revisions.
              </p>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Detail specific suggestions, questions regarding findings, or areas requiring elaboration..."
                value={commentsToAuthor}
                onChange={(e) => setCommentsToAuthor(e.target.value)}
              />
            </div>

            {/* Confidential Comments to Editor */}
            <div
              style={{
                background: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "10px",
                padding: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="badge badge-rejected" style={{ fontSize: "0.7rem" }}>
                  🔒 STRICTLY CONFIDENTIAL TO EDITOR
                </span>
                <span style={{ fontSize: "0.8rem", color: "#fca5a5" }}>
                  Will NEVER be shared with authors
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 10px" }}>
                Disclose any ethical concerns, suspected duplicate submissions, or frank assessments reserved only for the editorial board.
              </p>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Optional private remarks strictly for the handling editor..."
                value={confidentialCommentsToEditor}
                onChange={(e) => setConfidentialCommentsToEditor(e.target.value)}
              />
            </div>

            {/* Overall Comments */}
            <div>
              <label style={{ fontSize: "0.88rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                Overall Review Remarks & Executive Summary: <span style={{ color: "#f87171" }}>*</span>
              </label>
              <textarea
                className="form-input"
                rows={5}
                required
                placeholder="Summarize the core strengths, key weaknesses, and reasoning for your overall recommendation..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            {/* Submit buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => navigate("/reviewer")}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: "10px 24px" }}
              >
                {submitting ? "Submitting Review..." : "Submit Formal Review"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default WriteReviewPage;