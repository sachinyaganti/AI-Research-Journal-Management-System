import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

export default function PublishedPapersPage() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [expandedAbstracts, setExpandedAbstracts] = useState({});

  useEffect(() => {
    fetchPublishedPapers();
  }, []);

  const fetchPublishedPapers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/manuscripts/published`);
      if (!response.ok) {
        throw new Error("Failed to load published manuscripts");
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setPapers(list);
      setFilteredPapers(list);
    } catch (err) {
      setError(err.message || "Failed to load published papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...papers];

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (p) => (p.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.authorName || "").toLowerCase().includes(q) ||
          (p.keywords || "").toLowerCase().includes(q) ||
          (p.abstractText || "").toLowerCase().includes(q) ||
          (p.doi || "").toLowerCase().includes(q)
      );
    }

    setFilteredPapers(result);
  }, [searchQuery, selectedCategory, papers]);

  const toggleAbstract = (id) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [
    "ALL",
    ...Array.from(new Set(papers.map((p) => p.category).filter(Boolean)))
  ];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          padding: "36px 32px",
          marginBottom: "36px",
          textAlign: "left"
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span className="badge badge-accepted" style={{ fontSize: "0.75rem" }}>
            OPEN ACCESS
          </span>
          <span className="badge badge-submitted" style={{ fontSize: "0.75rem" }}>
            PEER REVIEWED
          </span>
        </div>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, margin: "0 0 12px 0", letterSpacing: "-0.03em" }}>
          Published Research Papers
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "800px", margin: 0 }}>
          Explore peer-reviewed scientific contributions published in the AI Research Journal. All articles are
          freely accessible with rigorous editorial integrity and full-text downloads.
        </p>

        {/* Quick Stats */}
        <div style={{ display: "flex", gap: "32px", marginTop: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-primary)" }}>
              {papers.length}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Published Articles
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981" }}>
              100%
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Peer-Reviewed
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#a855f7" }}>
              DOIs Assigned
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Cross-Referenced
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "28px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ flex: "1 1 320px", display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by title, author, keyword, or DOI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "btn btn-primary" : "btn btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "0.82rem" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--text-secondary)" }}>Loading published research...</p>
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            borderColor: "rgba(239, 68, 68, 0.4)",
            background: "rgba(239, 68, 68, 0.08)",
            color: "#fca5a5",
            padding: "20px",
            textAlign: "center"
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && filteredPapers.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "60px 24px",
            color: "var(--text-secondary)"
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📄</div>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
            No Published Manuscripts Found
          </h3>
          <p style={{ maxWidth: "480px", margin: "0 auto 20px" }}>
            {searchQuery
              ? "No articles matched your search query. Try broadening your criteria."
              : "No research papers have been published yet. Once editors accept and publish submissions, they will appear here."}
          </p>
          {searchQuery && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Papers Grid */}
      {!loading && !error && filteredPapers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredPapers.map((paper) => {
            const isExpanded = !!expandedAbstracts[paper.id];
            const abstract = paper.abstractText || "No abstract provided.";
            const isLong = abstract.length > 280;

            return (
              <article
                key={paper.id}
                className="card"
                style={{
                  textAlign: "left",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  transition: "transform 0.2s ease, border-color 0.2s ease"
                }}
              >
                {/* Meta header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="badge badge-accepted" style={{ fontSize: "0.75rem" }}>
                      PUBLISHED
                    </span>
                    {paper.category && (
                      <span className="badge badge-submitted" style={{ fontSize: "0.75rem" }}>
                        {paper.category}
                      </span>
                    )}
                    {paper.doi && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontFamily: "monospace",
                          color: "#38bdf8",
                          background: "rgba(56, 189, 248, 0.1)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid rgba(56, 189, 248, 0.2)"
                        }}
                      >
                        DOI: {paper.doi}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {paper.publishedAt
                      ? new Date(paper.publishedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })
                      : "Recently Published"}
                  </div>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--text-primary)",
                    lineHeight: 1.35
                  }}
                >
                  {paper.title}
                </h2>

                {/* Author & Volume Details */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    flexWrap: "wrap",
                    fontSize: "0.88rem",
                    color: "var(--text-secondary)"
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Author:</strong>{" "}
                    {paper.authorName || "Anonymous"}
                  </div>
                  {paper.volume && (
                    <div>
                      <strong style={{ color: "var(--text-primary)" }}>Volume:</strong>{" "}
                      {paper.volume}
                    </div>
                  )}
                  {paper.issue && (
                    <div>
                      <strong style={{ color: "var(--text-primary)" }}>Issue:</strong>{" "}
                      {paper.issue}
                    </div>
                  )}
                </div>

                {/* Abstract */}
                <div style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  <p style={{ margin: 0 }}>
                    {isLong && !isExpanded ? `${abstract.slice(0, 280)}...` : abstract}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => toggleAbstract(paper.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-primary)",
                        padding: 0,
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        marginTop: "6px"
                      }}
                    >
                      {isExpanded ? "Show Less ▲" : "Read Full Abstract ▼"}
                    </button>
                  )}
                </div>

                {/* Keywords & Actions Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)"
                  }}
                >
                  {/* Keywords */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Keywords:</span>
                    {paper.keywords
                      ? paper.keywords.split(",").map((kw, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "0.75rem",
                              background: "rgba(255, 255, 255, 0.05)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              color: "var(--text-secondary)"
                            }}
                          >
                            #{kw.trim()}
                          </span>
                        ))
                      : <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>General</span>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <a
                      href={`${API_BASE_URL}/api/manuscripts/${paper.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: "8px 18px", fontSize: "0.85rem", textDecoration: "none" }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginRight: "6px" }}
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download PDF
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
