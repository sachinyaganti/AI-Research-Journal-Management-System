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
    const [similarityResults, setSimilarityResults] = useState({});
    const [checkingSimilarityId, setCheckingSimilarityId] = useState(null);

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

    const handleCheckSimilarity = async (manuscriptId) => {
        setError("");
        setCheckingSimilarityId(manuscriptId);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/similarity`,
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
                    data.message || "Failed to check manuscript similarity"
                );
            }

            setSimilarityResults((previous) => ({
                ...previous,
                [manuscriptId]: data,
            }));
        } catch (err) {
            setError(
                err.message || "Failed to check manuscript similarity"
            );
        } finally {
            setCheckingSimilarityId(null);
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
                                                padding: "24px",
                                                border: "1px solid #444",
                                                borderRadius: "10px",
                                                backgroundColor: "#17181f",
                                            }}
                                        >
                                            <h3 style={{ marginTop: 0 }}>
                                                AI Manuscript Analysis
                                            </h3>

                                            <p
                                                style={{
                                                    marginTop: "4px",
                                                    marginBottom: "20px",
                                                    opacity: 0.75,
                                                    fontSize: "14px",
                                                }}
                                            >
                                                AI-powered academic analysis based on the manuscript
                                                information provided.
                                            </p>

                                            {/* Assessment */}
                                            <h4>Overall Assessment</h4>

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(180px, 1fr))",
                                                    gap: "10px",
                                                    marginBottom: "20px",
                                                }}
                                            >
                                                <div>
                                                    <strong>Abstract</strong>
                                                    <p>
                                                        {analysisResults[manuscript.id].abstract_quality}
                                                    </p>
                                                </div>

                                                <div>
                                                    <strong>Methodology</strong>
                                                    <p>
                                                        {analysisResults[manuscript.id].methodology_quality}
                                                    </p>
                                                </div>

                                                <div>
                                                    <strong>Results</strong>
                                                    <p>
                                                        {analysisResults[manuscript.id].results_quality}
                                                    </p>
                                                </div>

                                                <div>
                                                    <strong>Conclusion</strong>
                                                    <p>
                                                        {analysisResults[manuscript.id].conclusion_quality}
                                                    </p>
                                                </div>

                                                <div>
                                                    <strong>Writing Quality</strong>
                                                    <p>
                                                        {analysisResults[manuscript.id].writing_quality}
                                                    </p>
                                                </div>

                                                <div>
                                                    <strong>Research Relevance</strong>
                                                    <p>
                                                        {analysisResults[manuscript.id].relevance}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Basic Statistics */}
                                            <h4>Manuscript Statistics</h4>

                                            <p>
                                                <strong>Abstract Word Count:</strong>{" "}
                                                {analysisResults[manuscript.id].abstract_word_count}
                                            </p>

                                            <p>
                                                <strong>Keyword Count:</strong>{" "}
                                                {analysisResults[manuscript.id].keyword_count}
                                            </p>

                                            {/* Missing Sections */}
                                            {analysisResults[manuscript.id].missing_sections?.length > 0 && (
                                                <div style={{ marginTop: "20px" }}>
                                                    <h4>Missing / Weak Sections</h4>

                                                    <ul>
                                                        {analysisResults[manuscript.id].missing_sections.map(
                                                            (section, index) => (
                                                                <li key={index}>{section}</li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Writing Issues */}
                                            {analysisResults[manuscript.id].writing_issues?.length > 0 && (
                                                <div style={{ marginTop: "20px" }}>
                                                    <h4>Writing Issues</h4>

                                                    <ul>
                                                        {analysisResults[manuscript.id].writing_issues.map(
                                                            (issue, index) => (
                                                                <li key={index}>{issue}</li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Suggestions */}
                                            {analysisResults[manuscript.id].suggestions?.length > 0 && (
                                                <div style={{ marginTop: "20px" }}>
                                                    <h4>AI Suggestions</h4>

                                                    <ol>
                                                        {analysisResults[manuscript.id].suggestions.map(
                                                            (suggestion, index) => (
                                                                <li
                                                                    key={index}
                                                                    style={{
                                                                        marginBottom: "8px",
                                                                    }}
                                                                >
                                                                    {suggestion}
                                                                </li>
                                                            )
                                                        )}
                                                    </ol>
                                                </div>
                                            )}

                                            {/* Analysis Time */}
                                            {(analysisResults[manuscript.id].analyzedAt ||
                                                analysisResults[manuscript.id].analyzed_at) && (
                                                    <p
                                                        style={{
                                                            marginTop: "20px",
                                                            fontSize: "13px",
                                                            opacity: 0.65,
                                                        }}
                                                    >
                                                        <strong>Analyzed At:</strong>{" "}
                                                        {new Date(
                                                            analysisResults[manuscript.id].analyzedAt ||
                                                            analysisResults[manuscript.id].analyzed_at
                                                        ).toLocaleString()}
                                                    </p>
                                                )}
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
                                    <button
                                        onClick={() => handleCheckSimilarity(manuscript.id)}
                                        disabled={checkingSimilarityId === manuscript.id}
                                        style={{
                                            marginTop: "12px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        {checkingSimilarityId === manuscript.id
                                            ? "Checking..."
                                            : "Check Similarity"}
                                    </button>
                                    {similarityResults[manuscript.id] && (
                                        <div
                                            style={{
                                                marginTop: "20px",
                                                padding: "20px",
                                                border: "1px solid #444",
                                                borderRadius: "10px",
                                                backgroundColor: "#17181f",
                                            }}
                                        >
                                            <h3 style={{ marginTop: 0 }}>
                                                Manuscript Similarity Analysis
                                            </h3>

                                            <p>
                                                <strong>Similarity Percentage:</strong>{" "}
                                                {similarityResults[manuscript.id].similarity_percentage ??
                                                    similarityResults[manuscript.id].similarityPercentage ??
                                                    0}
                                                %
                                            </p>

                                            <p>
                                                <strong>Status:</strong>{" "}
                                                {similarityResults[manuscript.id].status}
                                            </p>

                                            {similarityResults[manuscript.id].matches?.length > 0 ? (
                                                <div>
                                                    <h4>Matching Manuscripts</h4>

                                                    <ul>
                                                        {similarityResults[manuscript.id].matches.map(
                                                            (match) => (
                                                                <li
                                                                    key={match.manuscript_id ?? match.manuscriptId}
                                                                    style={{ marginBottom: "10px" }}
                                                                >
                                                                    <strong>
                                                                        {match.title}
                                                                    </strong>

                                                                    {" — "}

                                                                    {match.similarity_percentage ??
                                                                        match.similarityPercentage ??
                                                                        0}
                                                                    %
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p>
                                                    No similar manuscripts were found.
                                                </p>
                                            )}
                                        </div>
                                    )}
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