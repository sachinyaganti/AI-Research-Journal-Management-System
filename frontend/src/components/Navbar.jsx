import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "EDITOR":
      case "ADMIN":
        return "badge-revision";
      case "REVIEWER":
        return "badge-under-review";
      case "AUTHOR":
      default:
        return "badge-submitted";
    }
  };

  return (
    <nav style={{
      background: "rgba(10, 15, 29, 0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "14px 24px"
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none"
        }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)"
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <span style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block"
            }}>
              AI Research Journal
            </span>
            <span style={{
              fontSize: "0.68rem",
              color: "#94a3b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600
            }}>
              Management System
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}>
          <Link
            to="/publications"
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: location.pathname === "/publications" ? "#a5b4fc" : "#94a3b8",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              background: location.pathname === "/publications" ? "rgba(99, 102, 241, 0.15)" : "transparent",
              transition: "all 0.2s ease"
            }}
          >
            Published Papers
          </Link>

          {token && (
            <Link
              to={getDashboardPath()}
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: location.pathname.startsWith(getDashboardPath()) ? "#a5b4fc" : "#94a3b8",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                background: location.pathname.startsWith(getDashboardPath()) ? "rgba(99, 102, 241, 0.15)" : "transparent",
                transition: "all 0.2s ease"
              }}
            >
              Dashboard
            </Link>
          )}

          {token && user?.role === "AUTHOR" && (
            <Link
              to="/author/manuscripts/new"
              className="btn btn-primary"
              style={{ padding: "7px 14px", fontSize: "0.85rem" }}
            >
              + Submit Paper
            </Link>
          )}
        </div>

        {/* Right Auth Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {token && user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "4px 10px 4px 6px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "9999px"
              }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700
                }}>
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
                <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f8fafc", display: "block" }}>
                    {user.fullName}
                  </span>
                </div>
                <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ padding: "2px 8px", fontSize: "0.68rem" }}>
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: "7px 14px", fontSize: "0.82rem" }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.88rem" }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.88rem" }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
