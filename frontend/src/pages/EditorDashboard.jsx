import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

const statuses = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUIRED",
  "ACCEPTED",
  "REJECTED",
  "PUBLISHED"
];

function EditorDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("SUBMITTED");
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reviewer assignment state
  const [reviewersList, setReviewersList] = useState([]);
  const [assignModalManuscript, setAssignModalManuscript] = useState(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [assignedReviewers, setAssignedReviewers] = useState([]);
  const [loadingAssign, setLoadingAssign] = useState(false);

  // Publish modal state
  const [publishModalManuscript, setPublishModalManuscript] = useState(null);
  const [publishForm, setPublishForm] = useState({
    volume: "Volume 1",
    issue: "Issue 1",
    doi: "",
    publicationNotes: "Final camera-ready version accepted and approved by editorial board."
  });
  const [publishing, setPublishing] = useState(false);

  // Load available reviewers
  const fetchReviewers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviewers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviewersList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch reviewers:", err);
    }
  };

  const fetchManuscripts = async (status) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const endpoint =
        status === "PUBLISHED"
          ? `${API_BASE_URL}/api/manuscripts/published`
          : `${API_BASE_URL}/api/manuscripts/status/${status}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load manuscripts");
      }

      const data = await response.json();
      setManuscripts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load manuscripts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchManuscripts(selectedStatus);
      fetchReviewers();
    }
  }, [token, selectedStatus]);

  const handleMoveToReview = async (id) => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/manuscripts/${id}/move-to-review`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to move manuscript to review");
      }

      setSuccessMessage("Manuscript moved to UNDER_REVIEW successfully.");
      await fetchManuscripts(selectedStatus);
    } catch (err) {
      setError(err.message || "Failed to move manuscript to review");
    }
  };

  // Open reviewer assignment modal
  const openAssignModal = async (manuscript) => {
    setAssignModalManuscript(manuscript);
    setSelectedReviewerId("");
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/manuscripts/${manuscript.id}/reviewers`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setAssignedReviewers(Array.isArray(data) ? data : []);
      } else {
        setAssignedReviewers([]);
      }
    } catch (e) {
      setAssignedReviewers([]);
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedReviewerId || !assignModalManuscript) return;
    setLoadingAssign(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/manuscripts/${assignModalManuscript.id}/reviewers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reviewerId: Number(selectedReviewerId) })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to assign reviewer");
      }

      setSuccessMessage("Reviewer assigned successfully!");
      // Reload assigned list
      const res = await fetch(
        `${API_BASE_URL}/api/manuscripts/${assignModalManuscript.id}/reviewers`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setAssignedReviewers(Array.isArray(updated) ? updated : []);
      }
      setSelectedReviewerId("");
    } catch (err) {
      setError(err.message || "Failed to assign reviewer");
    } finally {
      setLoadingAssign(false);
    }
  };

  // Open publication modal
  const openPublishModal = (manuscript) => {
    setPublishModalManuscript(manuscript);
    setPublishForm({
      volume: "Volume 1",
      issue: "Issue 1",
      doi: `10.5555/aij.${new Date().getFullYear()}.${manuscript.id.toString().padStart(4, "0")}`,
      publicationNotes: "Accepted following rigorous peer review and editorial approval."
    });
    setError("");
  };

  const handlePublishManuscript = async (e) => {
    e.preventDefault();
    if (!publishModalManuscript) return;
    setPublishing(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/manuscripts/${publishModalManuscript.id}/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(publishForm)
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to publish manuscript");
      }

      setSuccessMessage(`Paper "${publishModalManuscript.title}" is now PUBLISHED with DOI ${data.doi}!`);
      setPublishModalManuscript(null);
      await fetchManuscripts(selectedStatus);
    } catch (err) {
      setError(err.message || "Failed to publish manuscript");
    } finally {
      setPublishing(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "SUBMITTED":
        return <span className="badge badge-submitted">SUBMITTED</span>;
      case "UNDER_REVIEW":
        return <span className="badge badge-under-review">UNDER REVIEW</span>;
      case "REVISION_REQUIRED":
        return <span className="badge badge-revision">REVISION REQUIRED</span>;
      case "ACCEPTED":
        return <span className="badge badge-accepted">ACCEPTED</span>;
      case "PUBLISHED":
        return <span className="badge badge-accepted" style={{ background: "rgba(16, 185, 129, 0.25)" }}>PUBLISHED 🌟</span>;
      case "REJECTED":
        return <span className="badge badge-rejected">REJECTED</span>;
      default:
        return <span className="badge badge-submitted">{st}</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
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
          textAlign: "left",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(14, 165, 233, 0.08) 100%)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span className="badge badge-revision" style={{ fontSize: "0.75rem" }}>
              EDITORIAL BOARD PORTAL
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Editor Management Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
            Managing editor: <strong style={{ color: "#fff" }}>{user?.fullName}</strong> ({user?.email})
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => fetchManuscripts(selectedStatus)}
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem" }}
          >
            ↻ Refresh Feed
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          className="card"
          style={{
            borderColor: "rgba(16, 185, 129, 0.4)",
            background: "rgba(16, 185, 129, 0.1)",
            color: "#6ee7b7",
            padding: "16px 20px",
            marginBottom: "24px",
            textAlign: "left"
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            borderColor: "rgba(239, 68, 68, 0.4)",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#fca5a5",
            padding: "16px 20px",
            marginBottom: "24px",
            textAlign: "left"
          }}
        >
          ✕ {error}
        </div>
      )}

      {/* Status Filter Tabs */}
      <section style={{ marginBottom: "28px", textAlign: "left" }}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "8px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={selectedStatus === status ? "btn btn-primary" : "btn btn-secondary"}
              style={{
                fontSize: "0.82rem",
                padding: "8px 16px",
                border: "none",
                background: selectedStatus === status ? "var(--accent-primary)" : "transparent",
                color: selectedStatus === status ? "#fff" : "var(--text-secondary)"
              }}
            >
              {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      </section>

      {/* Manuscript Listings */}
      <section style={{ textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
            {selectedStatus.replaceAll("_", " ")} Submissions ({manuscripts.length})
          </h2>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
            <p style={{ color: "var(--text-secondary)" }}>Loading manuscripts...</p>
          </div>
        )}

        {!loading && manuscripts.length === 0 && (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "60px 24px",
              color: "var(--text-secondary)"
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📭</div>
            <h3 style={{ color: "var(--text-primary)", marginBottom: "6px" }}>
              No Submissions Found
            </h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              There are currently no manuscripts in the <strong>{selectedStatus.replaceAll("_", " ")}</strong> queue.
            </p>
          </div>
        )}

        {!loading && manuscripts.length > 0 && (
          <div style={{ display: "grid", gap: "20px" }}>
            {manuscripts.map((manuscript) => (
              <article
                key={manuscript.id}
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
                    {getStatusBadge(manuscript.status)}
                    {manuscript.category && (
                      <span className="badge badge-submitted">
                        {manuscript.category}
                      </span>
                    )}
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      ID: #{manuscript.id}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <a
                      href={`${API_BASE_URL}/api/manuscripts/${manuscript.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: "6px 14px", fontSize: "0.8rem", textDecoration: "none" }}
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
                  {manuscript.title}
                </h3>

                {/* Metadata Row */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    flexWrap: "wrap",
                    fontSize: "0.88rem",
                    color: "var(--text-secondary)",
                    background: "rgba(255, 255, 255, 0.02)",
                    padding: "12px 16px",
                    borderRadius: "8px"
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Author:</strong>{" "}
                    {manuscript.authorName} ({manuscript.authorEmail})
                  </div>
                  {manuscript.createdAt && (
                    <div>
                      <strong style={{ color: "var(--text-primary)" }}>Submitted:</strong>{" "}
                      {new Date(manuscript.createdAt).toLocaleDateString()}
                    </div>
                  )}
                  {manuscript.doi && (
                    <div>
                      <strong style={{ color: "var(--text-primary)" }}>DOI:</strong>{" "}
                      <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>{manuscript.doi}</span>
                    </div>
                  )}
                </div>

                {/* Abstract snippet */}
                {manuscript.abstractText && (
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>{manuscript.abstractText}</p>
                  </div>
                )}

                {/* Keywords */}
                {manuscript.keywords && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Keywords:</span>
                    {manuscript.keywords.split(",").map((kw, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "0.75rem",
                          background: "rgba(255, 255, 255, 0.06)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          color: "var(--text-secondary)"
                        }}
                      >
                        #{kw.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Workflow Actions Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {manuscript.status === "SUBMITTED" && (
                      <button
                        onClick={() => handleMoveToReview(manuscript.id)}
                        className="btn btn-primary"
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        ⚡ Advance to Review
                      </button>
                    )}

                    <button
                      onClick={() => openAssignModal(manuscript)}
                      className="btn btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                    >
                      👥 Assign Reviewers
                    </button>

                    <button
                      onClick={() => navigate(`/editor/manuscripts/${manuscript.id}/reviews`)}
                      className="btn btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                    >
                      📝 View Peer Reviews
                    </button>

                    <button
                      onClick={() => navigate(`/editor/manuscripts/${manuscript.id}/decision`)}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem", background: "#f59e0b" }}
                    >
                      ⚖ Make Editorial Decision
                    </button>

                    {manuscript.status === "ACCEPTED" && (
                      <button
                        onClick={() => openPublishModal(manuscript)}
                        className="btn btn-primary"
                        style={{ padding: "8px 18px", fontSize: "0.85rem", background: "#10b981" }}
                      >
                        🚀 Publish Open-Access
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Reviewer Assignment Modal */}
      {assignModalManuscript && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
            backdropFilter: "blur(6px)"
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "600px",
              width: "100%",
              padding: "32px",
              textAlign: "left",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem" }}>
                Assign Reviewers
              </h3>
              <button
                onClick={() => setAssignModalManuscript(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.3rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Manuscript: <strong>{assignModalManuscript.title}</strong>
            </p>

            {/* Currently Assigned */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "10px" }}>
                Current Assignments ({assignedReviewers.length})
              </h4>
              {assignedReviewers.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  No reviewers currently assigned to this manuscript.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {assignedReviewers.map((assign) => (
                    <div
                      key={assign.id}
                      style={{
                        padding: "10px 14px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "6px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: "0.88rem" }}>{assign.reviewerName}</strong>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          Assigned: {new Date(assign.assignedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge badge-under-review" style={{ fontSize: "0.72rem" }}>
                        {assign.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign new reviewer form */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "20px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Select Registered Reviewer:
              </label>
              <select
                className="form-select"
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                style={{ marginBottom: "16px" }}
              >
                <option value="">-- Choose a Reviewer --</option>
                {reviewersList.map((rev) => (
                  <option key={rev.id} value={rev.id}>
                    {rev.fullName} ({rev.email})
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setAssignModalManuscript(null)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 16px" }}
                >
                  Done
                </button>
                <button
                  type="button"
                  disabled={!selectedReviewerId || loadingAssign}
                  onClick={handleAssignReviewer}
                  className="btn btn-primary"
                  style={{ padding: "8px 18px" }}
                >
                  {loadingAssign ? "Assigning..." : "+ Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Paper Modal */}
      {publishModalManuscript && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
            backdropFilter: "blur(6px)"
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "600px",
              width: "100%",
              padding: "32px",
              textAlign: "left"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem" }}>
                Publish Manuscript Open-Access
              </h3>
              <button
                onClick={() => setPublishModalManuscript(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.3rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
              You are publishing: <strong>{publishModalManuscript.title}</strong>
            </p>

            <form onSubmit={handlePublishManuscript}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  DOI Identifier:
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={publishForm.doi}
                  onChange={(e) => setPublishForm({ ...publishForm, doi: e.target.value })}
                  placeholder="e.g. 10.5555/aij.2026.0001"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                    Volume:
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={publishForm.volume}
                    onChange={(e) => setPublishForm({ ...publishForm, volume: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                    Issue:
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={publishForm.issue}
                    onChange={(e) => setPublishForm({ ...publishForm, issue: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  Publication Notes / Release Remarks:
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={publishForm.publicationNotes}
                  onChange={(e) => setPublishForm({ ...publishForm, publicationNotes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setPublishModalManuscript(null)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="btn btn-primary"
                  style={{ padding: "8px 20px", background: "#10b981" }}
                >
                  {publishing ? "Publishing..." : "Confirm & Publish Paper"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorDashboard;