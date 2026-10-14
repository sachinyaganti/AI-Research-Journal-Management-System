import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, token } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "EDITOR":
      case "ADMIN":
        return "/editor";
      case "REVIEWER":
        return "/reviewer";
      case "AUTHOR":
      default:
        return "/author";
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          padding: "70px 20px 60px",
          position: "relative"
        }}
      >
        {/* Glow badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <span
            className="badge"
            style={{
              background: "rgba(99, 102, 241, 0.15)",
              color: "#a5b4fc",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              padding: "6px 14px",
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.04em"
            }}
          >
            ✨ NEXT-GEN ACADEMIC PUBLISHING & AI PEER REVIEW
          </span>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            maxWidth: "960px",
            margin: "0 auto 24px",
            background: "linear-gradient(135deg, #ffffff 20%, #cbd5e1 60%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Advancing Science through Intelligent Editorial Workflows
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            maxWidth: "760px",
            margin: "0 auto 36px",
            lineHeight: 1.6
          }}
        >
          A state-of-the-art research journal management platform featuring automated AI pre-screening,
          confidential double-blind peer review, similarity analysis, and seamless revision cycles.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          {token ? (
            <Link
              to={getDashboardPath()}
              className="btn btn-primary"
              style={{ padding: "12px 28px", fontSize: "1rem", fontWeight: 700 }}
            >
              Open Your Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ padding: "12px 28px", fontSize: "1rem", fontWeight: 700 }}
              >
                Submit Manuscript
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ padding: "12px 28px", fontSize: "1rem", fontWeight: 600 }}
              >
                Sign In to Journal
              </Link>
            </>
          )}

          <Link
            to="/publications"
            className="btn btn-secondary"
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              borderColor: "rgba(99, 102, 241, 0.4)",
              background: "rgba(99, 102, 241, 0.08)"
            }}
          >
            Browse Published Papers 📚
          </Link>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            maxWidth: "1000px",
            margin: "60px auto 0",
            textAlign: "center"
          }}
        >
          <div className="card" style={{ padding: "24px 16px" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-primary)" }}>
              &lt; 48 Hrs
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
              Initial Editorial Screening
            </div>
          </div>
          <div className="card" style={{ padding: "24px 16px" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981" }}>
              100%
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
              Blinded Peer-Review Integrity
            </div>
          </div>
          <div className="card" style={{ padding: "24px 16px" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#38bdf8" }}>
              AI + Similarity
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
              Internal Screening Engine
            </div>
          </div>
          <div className="card" style={{ padding: "24px 16px" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a855f7" }}>
              Open Access
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
              Direct Public PDF Downloads
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Section */}
      <section style={{ marginTop: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 10px 0" }}>
            Engineered for Modern Scientific Rigor
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto" }}>
            Built from the ground up to respect academic integrity while eliminating editorial bottlenecks.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px"
          }}
        >
          {/* Card 1 */}
          <div className="card" style={{ textAlign: "left", padding: "30px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "18px"
              }}
            >
              🤖
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 10px 0" }}>
              Automated AI Quality Screening
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
              Authors receive instant probabilistic diagnostics evaluating methodology, writing clarity, section
              completeness, and structural soundness before formal peer review begins.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ textAlign: "left", padding: "30px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "18px"
              }}
            >
              🔒
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 10px 0" }}>
              Strict Confidentiality & Anonymity
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
              Confidential comments between reviewers and editors are protected by backend role-level enforcement.
              Authors only receive constructive blinded feedback.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ textAlign: "left", padding: "30px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "18px"
              }}
            >
              📊
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 10px 0" }}>
              Similarity & Plagiarism Radar
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
              Multi-token internal similarity scoring highlights shared academic passages across repository manuscripts
              to assist editorial staff in vetting novelty.
            </p>
          </div>

          {/* Card 4 */}
          <div className="card" style={{ textAlign: "left", padding: "30px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "18px"
              }}
            >
              🔄
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 10px 0" }}>
              Structured Revision Cycles
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
              Authors can upload revised drafts accompanied by point-by-point response notes, while complete version
              history is securely archived for editorial audits.
            </p>
          </div>

          {/* Card 5 */}
          <div className="card" style={{ textAlign: "left", padding: "30px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(168, 85, 247, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "18px"
              }}
            >
              ⭐
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 10px 0" }}>
              Multi-Criteria Review Scoring
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
              Reviewers rate submissions across clarity, originality, and methodology on 1-5 scales, accompanied by
              formal editorial recommendations.
            </p>
          </div>

          {/* Card 6 */}
          <div className="card" style={{ textAlign: "left", padding: "30px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(236, 72, 153, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "18px"
              }}
            >
              🌐
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 10px 0" }}>
              Instant Open-Access Publishing
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
              Editors assign Volume, Issue, and DOI upon acceptance, immediately making published manuscripts
              discoverable and downloadable to the global scientific community.
            </p>
          </div>
        </div>
      </section>

      {/* Publication Workflow Steps */}
      <section style={{ marginTop: "70px" }}>
        <div className="card" style={{ padding: "40px 32px", textAlign: "left" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 24px 0" }}>
            The Editorial & Review Lifecycle
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px"
            }}
          >
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "6px" }}>
                STEP 01
              </div>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>Author Submission</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Submit manuscript details, abstract, keywords, and PDF document with instant screening diagnostics.
              </p>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "6px" }}>
                STEP 02
              </div>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>Editorial Assignment</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Managing editors triage submissions, conduct similarity checks, and assign qualified peer reviewers.
              </p>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "6px" }}>
                STEP 03
              </div>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>Peer Review</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Reviewers evaluate clarity, originality, and methodology, submitting structured recommendations.
              </p>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "6px" }}>
                STEP 04
              </div>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>Revision & Decision</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Editors issue decision letters. Authors submit revisions with point-by-point response notes.
              </p>
            </div>

            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "6px" }}>
                STEP 05
              </div>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>Open Access Release</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Accepted manuscripts receive DOI, Volume, and Issue assignments and are published openly online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: "70px",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          color: "var(--text-muted)",
          fontSize: "0.85rem"
        }}
      >
        <div>
          © {new Date().getFullYear()} AI Research Journal Management System. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/publications" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            Published Archive
          </Link>
          <Link to="/login" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            Editorial Portal
          </Link>
          <Link to="/register" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            Author Registration
          </Link>
        </div>
      </footer>
    </div>
  );
}