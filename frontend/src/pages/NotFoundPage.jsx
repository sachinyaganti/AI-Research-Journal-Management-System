import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div style={{ maxWidth: "600px", margin: "100px auto", padding: "0 24px", textAlign: "center" }}>
      <div className="card" style={{ padding: "48px 32px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, margin: "0 0 12px 0" }}>404</h1>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 20px 0" }}>
          Page Not Found
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "28px" }}>
          The manuscript page or editorial resource you requested could not be located.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: "10px 24px" }}>
          Return to Journal Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;