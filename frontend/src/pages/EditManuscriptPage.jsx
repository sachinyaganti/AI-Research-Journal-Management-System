import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

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
                const response = await fetch(
                    `${API_BASE_URL}/api/manuscripts/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load manuscript"
                    );
                }

                setFormData({
                    title: data.title || "",
                    abstractText: data.abstractText || "",
                    keywords: data.keywords || "",
                    category: data.category || "",
                });
            } catch (err) {
                setError(
                    err.message || "Failed to load manuscript"
                );
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
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update manuscript"
                );
            }

            navigate("/author");
        } catch (err) {
            setError(
                err.message || "Failed to update manuscript"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "32px" }}>
                <p>Loading manuscript...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "32px", textAlign: "left" }}>
            <h1>Edit Manuscript</h1>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">
                        Title
                    </label>
                    <br />
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={500}
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="abstractText">
                        Abstract
                    </label>
                    <br />
                    <textarea
                        id="abstractText"
                        name="abstractText"
                        value={formData.abstractText}
                        onChange={handleChange}
                        rows={8}
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="keywords">
                        Keywords
                    </label>
                    <br />
                    <input
                        id="keywords"
                        name="keywords"
                        type="text"
                        value={formData.keywords}
                        onChange={handleChange}
                        maxLength={1000}
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="category">
                        Category
                    </label>
                    <br />
                    <input
                        id="category"
                        name="category"
                        type="text"
                        value={formData.category}
                        onChange={handleChange}
                        maxLength={255}
                        required
                    />
                </div>

                <br />

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/author")}
                    style={{ marginLeft: "10px" }}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default EditManuscriptPage;