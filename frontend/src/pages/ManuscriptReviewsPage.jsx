import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://research-journal-backend-docker.onrender.com";

function ManuscriptReviewsPage() {
  const { manuscriptId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/manuscripts/${manuscriptId}/reviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load reviews");
        }

        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReviews();
    }
  }, [manuscriptId, token]);

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case "ACCEPT":
        return <span className="badge badge-accepted">ACCEPT</span>;
      case "MINOR_REVISION":
        return <span className="badge badge-revision">MINOR REVISION</span>;
      case "MAJOR_REVISION":
        return <span className="badge badge-revision" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171" }}>MAJOR REVISION</span>;
      case "REJECT":
        return <span className="badge badge-rejected">REJECT</span>;
      default:
        return <span className="badge badge-submitted">{rec}</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 24px", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
          ← Back
        </button>

        <a
          href={`${API_BASE_URL}/api/manuscripts/${manuscriptId}/pdf${token ? `?token=${encodeURIComponent(token)}` : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ fontSize: "0.85rem", textDecoration: "none" }}
        >
          📄 View Manuscript PDF
        </a>
      </div>

      <div className="card" style={{ padding: "32px", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span className="badge badge-submitted" style={{ fontSize: "0.75rem" }}>
            PEER REVIEW DOSSIER
          </span>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Manuscript ID #{manuscriptId}
          </span>
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          Peer Reviews & Evaluations
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "6px 0 0" }}>
          Submissions received from peer reviewers for this manuscript.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--text-secondary)" }}>Loading peer reviews...</p>
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            borderColor: "rgba(239, 68, 68, 0.4)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#fca5a5",
            padding: "16px 20px"
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "50px 20px",
            color: "var(--text-secondary)"
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📝</div>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "6px" }}>
            No Reviews Submitted Yet
          </h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Assigned reviewers have not yet finished their evaluations for this manuscript.
          </p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {reviews.map((review, index) => (
            <article
              key={review.id}
              className="card"
              style={{
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingBottom: "16px"
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-primary)" }}>
                    Review #{index + 1}
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    By: <strong style={{ color: "#fff" }}>{review.reviewerName || "Anonymous Reviewer"}</strong>
                    {review.createdAt && ` • Submitted on ${new Date(review.createdAt).toLocaleDateString()}`}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {getRecommendationBadge(review.recommendation)}
                  <span
                    style={{
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "#a5b4fc",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 700
                    }}
                  >
                    ★ {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Criteria Scores Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Clarity Score
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {review.clarityRating ? `${review.clarityRating}/5` : "N/A"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Originality Score
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {review.originalityRating ? `${review.originalityRating}/5` : "N/A"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Methodology Score
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                    {review.methodologyRating ? `${review.methodologyRating}/5` : "N/A"}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {review.commentsToAuthor && (
                  <div>
                    <h4 style={{ fontSize: "0.95rem", color: "var(--accent-primary)", margin: "0 0 6px 0" }}>
                      Comments to Author:
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {review.commentsToAuthor}
                    </p>
                  </div>
                )}

                {review.confidentialCommentsToEditor && (
                  <div
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      borderRadius: "8px",
                      padding: "16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span className="badge badge-rejected" style={{ fontSize: "0.7rem" }}>
                        🔒 EDITOR-ONLY CONFIDENTIAL
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "#fca5a5" }}>
                        Hidden from authors at all times
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#fecaca", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {review.confidentialCommentsToEditor}
                    </p>
                  </div>
                )}

                <div>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", margin: "0 0 6px 0" }}>
                    Overall Review Remarks:
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {review.comments}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManuscriptReviewsPage;