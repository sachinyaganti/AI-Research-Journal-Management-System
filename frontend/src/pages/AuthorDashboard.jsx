import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function AuthorDashboard() {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [analysisResults, setAnalysisResults] = useState({});
    const [analyzingId, setAnalyzingId] = useState(null);

    const fetchManuscripts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data.message || "Failed to load manuscripts"
                );
            }

            const data = await response.json();
            setManuscripts(data);

        } catch (err) {
            setError(
                err.message || "Failed to load manuscripts"
            );
        } finally {
            setLoading(false);
        }
    };
    const fetchAnalysis = async (manuscriptId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/analysis`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 404) {
                return;
            }

            if (!response.ok) {
                console.error(
                    `Failed to load AI analysis for manuscript ${manuscriptId}: ${response.status}`
                );
                return;
            }

            const data = await response.json();

            const normalizedData = {
                ...data,
                abstract_word_count: data.abstract_word_count ?? data.abstractWordCount ?? 0,
                keyword_count: data.keyword_count ?? data.keywordCount ?? 0,
                abstract_quality: data.abstract_quality ?? data.abstractQuality ?? "",
                methodology_quality:
                    data.methodology_quality ?? data.methodologyQuality ?? "",
                results_quality:
                    data.results_quality ?? data.resultsQuality ?? "",
                conclusion_quality:
                    data.conclusion_quality ?? data.conclusionQuality ?? "",
                writing_quality:
                    data.writing_quality ?? data.writingQuality ?? "",
                missing_sections:
                    data.missing_sections ?? data.missingSections ?? [],
                writing_issues:
                    data.writing_issues ?? data.writingIssues ?? [],
                suggestions: data.suggestions ?? [],
            };

            setAnalysisResults((previous) => ({
                ...previous,
                [manuscriptId]: normalizedData,
            }));
        } catch (err) {
            console.error(
                "Failed to load saved AI analysis:",
                err
            );
        }
    };

    useEffect(() => {
        if (!token) {
            return;
        }

        const loadDashboard = async () => {
            await fetchManuscripts();
        };

        loadDashboard();
    }, [token]);

    const handleSubmit = async (id) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${id}/submit`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to submit manuscript"
                );
            }

            await fetchManuscripts();
        } catch (err) {
            setError(
                err.message || "Failed to submit manuscript"
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this draft?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data.message || "Failed to delete manuscript"
                );
            }

            await fetchManuscripts();
        } catch (err) {
            setError(
                err.message || "Failed to delete manuscript"
            );
        }
    };
    const handleAnalyze = async (manuscriptId) => {
        setError("");
        setAnalyzingId(manuscriptId);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/analyze`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to analyze manuscript"
                );
            }

            setAnalysisResults((previous) => ({
                ...previous,
                [manuscriptId]: data,
            }));
        } catch (err) {
            setError(
                err.message || "Failed to analyze manuscript"
            );
        } finally {
            setAnalyzingId(null);
        }
    };

    return (
        <div style={{ padding: "32px", textAlign: "left" }}>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>
                        Author Dashboard
                    </h1>

                    <p>
                        Welcome, {user?.fullName}
                    </p>
                </div>

                <button onClick={logout}>
                    Logout
                </button>
            </header>

            <section>
                <h2>My Manuscripts</h2>

                {loading && (
                    <p>Loading manuscripts...</p>
                )}

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}

                {!loading &&
                    !error &&
                    manuscripts.length === 0 && (
                        <p>
                            You haven't created any manuscripts yet.
                        </p>
                    )}

                {!loading &&
                    manuscripts.length > 0 && (
                        <div
                            style={{
                                display: "grid",
                                gap: "16px",
                                marginTop: "20px",
                            }}
                        >
                            {manuscripts.map((manuscript) => (
                                <article
                                    key={manuscript.id}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "20px",
                                    }}
                                >
                                    <h2>
                                        {manuscript.title}
                                    </h2>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {manuscript.status}
                                    </p>
                                    {analysisResults[manuscript.id] && (
                                        <div
                                            style={{
                                                marginTop: "16px",
                                                padding: "20px",
                                                border: "1px solid #ccc",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            <h3>AI Analysis</h3>

                                            <p>
                                                <strong>Abstract Quality:</strong>{" "}
                                                {analysisResults[manuscript.id].abstract_quality}
                                            </p>

                                            <p>
                                                <strong>Methodology:</strong>{" "}
                                                {analysisResults[manuscript.id].methodology_quality}
                                            </p>

                                            <p>
                                                <strong>Results:</strong>{" "}
                                                {analysisResults[manuscript.id].results_quality}
                                            </p>

                                            <p>
                                                <strong>Conclusion:</strong>{" "}
                                                {analysisResults[manuscript.id].conclusion_quality}
                                            </p>

                                            <p>
                                                <strong>Writing Quality:</strong>{" "}
                                                {analysisResults[manuscript.id].writing_quality}
                                            </p>

                                            <p>
                                                <strong>Research Relevance:</strong>{" "}
                                                {analysisResults[manuscript.id].relevance}
                                            </p>

                                            <p>
                                                <strong>Abstract Word Count:</strong>{" "}
                                                {analysisResults[manuscript.id].abstract_word_count}
                                            </p>

                                            <p>
                                                <strong>Keyword Count:</strong>{" "}
                                                {analysisResults[manuscript.id].keyword_count}
                                            </p>

                                            {analysisResults[manuscript.id].missing_sections.length > 0 && (
                                                <div>
                                                    <strong>Missing / Weak Sections:</strong>

                                                    <ul>
                                                        {analysisResults[manuscript.id].missing_sections.map(
                                                            (section, index) => (
                                                                <li key={index}>{section}</li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            {analysisResults[manuscript.id].writing_issues.length > 0 && (
                                                <div>
                                                    <strong>Writing Issues:</strong>

                                                    <ul>
                                                        {analysisResults[manuscript.id].writing_issues.map(
                                                            (issue, index) => (
                                                                <li key={index}>{issue}</li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            <div>
                                                <strong>Suggestions:</strong>

                                                <ul>
                                                    {analysisResults[manuscript.id].suggestions.map(
                                                        (suggestion, index) => (
                                                            <li key={index}>{suggestion}</li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleAnalyze(manuscript.id)}
                                        disabled={analyzingId === manuscript.id}
                                        style={{
                                            marginTop: "12px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        {analyzingId === manuscript.id
                                            ? "Analyzing..."
                                            : "Analyze with AI"}
                                    </button>
                                    <p>
                                        <strong>Category:</strong>{" "}
                                        {manuscript.category}
                                    </p>

                                    <p>
                                        <strong>Keywords:</strong>{" "}
                                        {manuscript.keywords}
                                    </p>

                                    <p
                                        style={{
                                            marginTop: "12px",
                                        }}
                                    >
                                        {manuscript.abstractText}
                                    </p>

                                    {(manuscript.status === "DRAFT" ||
                                        manuscript.status === "REVISION_REQUIRED") && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "10px",
                                                    marginTop: "16px",
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/author/manuscripts/${manuscript.id}/edit`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleSubmit(manuscript.id)
                                                    }
                                                >
                                                    Submit
                                                </button>

                                                {manuscript.status === "DRAFT" && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(manuscript.id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                </article>
                            ))}
                        </div>
                    )}
            </section>
        </div>
    );
}

export default AuthorDashboard;