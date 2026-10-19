import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://research-journal-backend-docker.onrender.com";

function EditManuscriptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    abstractText: "",
    keywords: "",
    category: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchManuscript = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/manuscripts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load manuscript");
        }

        setFormData({
          title: data.title || "",
          abstractText: data.abstractText || "",
          keywords: data.keywords || "",
          category: data.category || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load manuscript");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchManuscript();
    }
  }, [id, token]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/manuscripts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update manuscript");
      }

      navigate("/author");
    } catch (err) {
      setError(err.message || "Failed to update manuscript");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
        <p style={{ color: "var(--text-secondary)" }}>Loading manuscript metadata...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 24px", textAlign: "left" }}>
      <button
        type="button"
        onClick={() => navigate("/author")}
        className="btn btn-secondary"
        style={{ marginBottom: "20px", fontSize: "0.85rem" }}
      >
        ← Back to Author Dashboard
      </button>

      <div className="card" style={{ padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span className="badge badge-submitted" style={{ fontSize: "0.75rem" }}>
            METADATA EDITOR
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Manuscript #{id}
          </span>
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 24px 0", letterSpacing: "-0.02em" }}>
          Edit Manuscript Metadata
        </h1>

        {error && (
          <div
            className="card"
            style={{
              borderColor: "rgba(239, 68, 68, 0.4)",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#fca5a5",
              padding: "14px 18px",
              marginBottom: "20px"
            }}
          >
            ✕ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label htmlFor="title" style={{ fontSize: "0.88rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Manuscript Title: <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              maxLength={500}
              required
            />
          </div>

          <div>
            <label htmlFor="category" style={{ fontSize: "0.88rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Field / Category: <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              id="category"
              name="category"
              type="text"
              className="form-input"
              value={formData.category}
              onChange={handleChange}
              maxLength={255}
              required
            />
          </div>

          <div>
            <label htmlFor="keywords" style={{ fontSize: "0.88rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Keywords (comma-separated):
            </label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              className="form-input"
              value={formData.keywords}
              onChange={handleChange}
              maxLength={1000}
            />
          </div>

          <div>
            <label htmlFor="abstractText" style={{ fontSize: "0.88rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Abstract: <span style={{ color: "#f87171" }}>*</span>
            </label>
            <textarea
              id="abstractText"
              name="abstractText"
              className="form-input"
              value={formData.abstractText}
              onChange={handleChange}
              rows={8}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => navigate("/author")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: "10px 24px" }}
            >
              {saving ? "Saving Changes..." : "Save Manuscript Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditManuscriptPage;