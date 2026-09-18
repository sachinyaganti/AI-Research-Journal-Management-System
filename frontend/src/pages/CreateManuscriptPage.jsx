import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function CreateManuscriptPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        abstractText: "",
        keywords: "",
        category: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts`,
                {
                    method: "POST",
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
                    data.message || "Failed to create manuscript"
                );
            }

            navigate("/author");
        } catch (err) {
            setError(
                err.message || "Failed to create manuscript"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "32px", textAlign: "left" }}>
            <h1>Create Manuscript</h1>

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
                        placeholder="AI, machine learning, peer review"
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
                    disabled={loading}
                >
                    {loading
                        ? "Creating..."
                        : "Create Draft"}
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

export default CreateManuscriptPage;