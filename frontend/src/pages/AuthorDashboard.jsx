import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function AuthorDashboard() {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();

    // =========================================================
    // STATE
    // =========================================================

    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // AI Analysis
    const [analysisResults, setAnalysisResults] = useState({});
    const [analyzingId, setAnalyzingId] = useState(null);

    // Similarity
    const [similarityResults, setSimilarityResults] = useState({});
    const [checkingSimilarityId, setCheckingSimilarityId] =
        useState(null);

    // PDF Management
    const [uploadingFileId, setUploadingFileId] = useState(null);
    const [fileUploadError, setFileUploadError] = useState("");
    const [selectedManuscriptId, setSelectedManuscriptId] =
        useState("");

    // =========================================================
    // FETCH MANUSCRIPTS
    // =========================================================

    const fetchManuscripts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response
                    .json()
                    .catch(() => ({}));

                throw new Error(
                    data.message ||
                    "Failed to load manuscripts"
                );
            }

            const data = await response.json();

            setManuscripts(data);
        } catch (err) {
            setError(
                err.message ||
                "Failed to load manuscripts"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH SAVED AI ANALYSIS
    // =========================================================

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

                abstract_word_count:
                    data.abstract_word_count ??
                    data.abstractWordCount ??
                    0,

                keyword_count:
                    data.keyword_count ??
                    data.keywordCount ??
                    0,

                abstract_quality:
                    data.abstract_quality ??
                    data.abstractQuality ??
                    "",

                methodology_quality:
                    data.methodology_quality ??
                    data.methodologyQuality ??
                    "",

                results_quality:
                    data.results_quality ??
                    data.resultsQuality ??
                    "",

                conclusion_quality:
                    data.conclusion_quality ??
                    data.conclusionQuality ??
                    "",

                writing_quality:
                    data.writing_quality ??
                    data.writingQuality ??
                    "",

                missing_sections:
                    data.missing_sections ??
                    data.missingSections ??
                    [],

                writing_issues:
                    data.writing_issues ??
                    data.writingIssues ??
                    [],

                suggestions:
                    data.suggestions ?? [],
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

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        if (!token) {
            return;
        }

        const loadDashboard = async () => {
            await fetchManuscripts();
        };

        loadDashboard();
    }, [token]);

    // =========================================================
    // LOAD SAVED ANALYSIS WHEN MANUSCRIPTS ARE AVAILABLE
    // =========================================================

    useEffect(() => {
        if (!token || manuscripts.length === 0) {
            return;
        }

        manuscripts.forEach((manuscript) => {
            fetchAnalysis(manuscript.id);
        });
    }, [manuscripts, token]);

    // =========================================================
    // SUBMIT MANUSCRIPT
    // =========================================================

    const handleSubmit = async (id) => {
        setError("");

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

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to submit manuscript"
                );
            }

            await fetchManuscripts();
        } catch (err) {
            setError(
                err.message ||
                "Failed to submit manuscript"
            );
        }
    };

    // =========================================================
    // DELETE MANUSCRIPT
    // =========================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this draft?"
        );

        if (!confirmed) {
            return;
        }

        setError("");

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
                const data = await response
                    .json()
                    .catch(() => ({}));

                throw new Error(
                    data.message ||
                    "Failed to delete manuscript"
                );
            }

            if (
                String(selectedManuscriptId) ===
                String(id)
            ) {
                setSelectedManuscriptId("");
            }

            await fetchManuscripts();
        } catch (err) {
            setError(
                err.message ||
                "Failed to delete manuscript"
            );
        }
    };

    // =========================================================
    // AI ANALYSIS
    // =========================================================

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
                    data.message ||
                    "Failed to analyze manuscript"
                );
            }

            setAnalysisResults((previous) => ({
                ...previous,
                [manuscriptId]: data,
            }));
        } catch (err) {
            setError(
                err.message ||
                "Failed to analyze manuscript"
            );
        } finally {
            setAnalyzingId(null);
        }
    };

    // =========================================================
    // PDF FILE UPLOAD
    // =========================================================

    const handleFileUpload = async (
        manuscriptId,
        file
    ) => {
        if (!file) {
            return;
        }

        setFileUploadError("");

        // Only PDF
        if (file.type !== "application/pdf") {
            setFileUploadError(
                "Only PDF files are allowed."
            );
            return;
        }

        // Maximum file size = 10 MB
        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            setFileUploadError(
                "PDF file size must be less than or equal to 10 MB."
            );
            return;
        }

        setUploadingFileId(manuscriptId);

        try {
            const formData = new FormData();

            formData.append("file", file);

            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/file`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to upload PDF"
                );
            }

            // Update the selected manuscript
            // immediately in the frontend
            setManuscripts((previous) =>
                previous.map((manuscript) =>
                    manuscript.id === manuscriptId
                        ? {
                            ...manuscript,
                            fileName:
                                data.fileName,
                            fileType:
                                data.fileType,
                            fileSize:
                                data.fileSize,
                        }
                        : manuscript
                )
            );

            setFileUploadError("");
        } catch (err) {
            setFileUploadError(
                err.message ||
                "Failed to upload PDF"
            );
        } finally {
            setUploadingFileId(null);
        }
    };

    // =========================================================
    // CHECK SIMILARITY
    // =========================================================

    const handleCheckSimilarity = async (
        manuscriptId
    ) => {
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
                    data.message ||
                    "Failed to check manuscript similarity"
                );
            }

            setSimilarityResults((previous) => ({
                ...previous,
                [manuscriptId]: data,
            }));
        } catch (err) {
            setError(
                err.message ||
                "Failed to check manuscript similarity"
            );
        } finally {
            setCheckingSimilarityId(null);
        }
    };

    // =========================================================
    // SELECTED MANUSCRIPT FOR PDF MANAGEMENT
    // =========================================================

    const selectedManuscript =
        manuscripts.find(
            (manuscript) =>
                String(manuscript.id) ===
                String(selectedManuscriptId)
        );

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            style={{
                padding: "32px",
                textAlign: "left",
            }}
        >
            {/* =====================================================
                HEADER
            ====================================================== */}

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

            {/* =====================================================
                GENERAL ERROR
            ====================================================== */}

            {error && (
                <p
                    role="alert"
                    style={{
                        color: "red",
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </p>
            )}

            {/* =====================================================
                PDF MANAGEMENT
            ====================================================== */}

            <section
                style={{
                    marginBottom: "32px",
                    padding: "20px",
                    border: "1px solid #444",
                    borderRadius: "10px",
                    backgroundColor: "#17181f",
                }}
            >
                <h2 style={{ marginTop: 0 }}>
                    Manuscript PDF Management
                </h2>

                <p
                    style={{
                        opacity: 0.75,
                    }}
                >
                    Upload or replace the PDF associated
                    with one of your manuscripts.
                </p>

                {/* Select manuscript */}

                <div
                    style={{
                        marginTop: "16px",
                    }}
                >
                    <label
                        htmlFor="manuscript-select"
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "bold",
                        }}
                    >
                        Select Manuscript
                    </label>

                    <select
                        id="manuscript-select"
                        value={selectedManuscriptId}
                        onChange={(event) => {
                            setSelectedManuscriptId(
                                event.target.value
                            );
                            setFileUploadError("");
                        }}
                        style={{
                            width: "100%",
                            maxWidth: "600px",
                            padding: "10px",
                            borderRadius: "6px",
                        }}
                    >
                        <option value="">
                            Select a manuscript
                        </option>

                        {manuscripts.map(
                            (manuscript) => (
                                <option
                                    key={manuscript.id}
                                    value={manuscript.id}
                                >
                                    {manuscript.title}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Selected manuscript */}

                {selectedManuscript && (
                    <div
                        style={{
                            marginTop: "20px",
                        }}
                    >
                        {/* Current PDF */}

                        {selectedManuscript.fileName ? (
                            <div>
                                <p>
                                    <strong>
                                        Current PDF:
                                    </strong>{" "}
                                    {
                                        selectedManuscript.fileName
                                    }
                                </p>

                                {selectedManuscript.fileSize && (
                                    <p
                                        style={{
                                            opacity: 0.7,
                                        }}
                                    >
                                        <strong>
                                            File Size:
                                        </strong>{" "}
                                        {(
                                            selectedManuscript.fileSize /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{" "}
                                        MB
                                    </p>
                                )}

                                <a
                                    href={`${API_BASE_URL}/api/manuscripts/${selectedManuscript.id}/file`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display:
                                            "inline-block",
                                        marginBottom:
                                            "12px",
                                        marginRight:
                                            "12px",
                                    }}
                                >
                                    View PDF
                                </a>
                            </div>
                        ) : (
                            <p>
                                <strong>
                                    Current PDF:
                                </strong>{" "}
                                No PDF uploaded
                            </p>
                        )}

                        {/* Hidden file input */}

                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            id="manuscript-pdf-upload"
                            style={{
                                display: "none",
                            }}
                            disabled={
                                uploadingFileId ===
                                selectedManuscript.id
                            }
                            onChange={(event) => {
                                const file =
                                    event.target.files?.[0];

                                if (file) {
                                    handleFileUpload(
                                        selectedManuscript.id,
                                        file
                                    );
                                }

                                // Reset input so the same
                                // file can be selected again.
                                event.target.value = "";
                            }}
                        />

                        {/* Upload / Replace button */}

                        <label
                            htmlFor="manuscript-pdf-upload"
                            style={{
                                display:
                                    "inline-block",
                                padding: "10px 16px",
                                border: "1px solid #555",
                                borderRadius: "6px",
                                cursor:
                                    uploadingFileId ===
                                        selectedManuscript.id
                                        ? "not-allowed"
                                        : "pointer",
                                marginTop: "8px",
                                opacity:
                                    uploadingFileId ===
                                        selectedManuscript.id
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            {uploadingFileId ===
                                selectedManuscript.id
                                ? "Uploading..."
                                : selectedManuscript.fileName
                                    ? "Replace PDF"
                                    : "Upload PDF"}
                        </label>
                    </div>
                )}

                {/* Upload error */}

                {fileUploadError && (
                    <p
                        role="alert"
                        style={{
                            color: "red",
                            marginTop: "12px",
                        }}
                    >
                        {fileUploadError}
                    </p>
                )}
            </section>

            {/* =====================================================
                MY MANUSCRIPTS
            ====================================================== */}

            <section>
                <h2>My Manuscripts</h2>

                {loading && (
                    <p>Loading manuscripts...</p>
                )}

                {!loading &&
                    !error &&
                    manuscripts.length === 0 && (
                        <p>
                            You haven't created any
                            manuscripts yet.
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
                            {manuscripts.map(
                                (manuscript) => (
                                    <article
                                        key={
                                            manuscript.id
                                        }
                                        style={{
                                            border:
                                                "1px solid #ddd",
                                            borderRadius:
                                                "8px",
                                            padding:
                                                "20px",
                                        }}
                                    >
                                        {/* =================================================
                                            BASIC MANUSCRIPT INFORMATION
                                        ================================================== */}

                                        <h2>
                                            {
                                                manuscript.title
                                            }
                                        </h2>

                                        <p>
                                            <strong>
                                                Status:
                                            </strong>{" "}
                                            {
                                                manuscript.status
                                            }
                                        </p>

                                        <p>
                                            <strong>
                                                Category:
                                            </strong>{" "}
                                            {
                                                manuscript.category
                                            }
                                        </p>

                                        <p>
                                            <strong>
                                                Keywords:
                                            </strong>{" "}
                                            {
                                                manuscript.keywords
                                            }
                                        </p>

                                        <p
                                            style={{
                                                marginTop:
                                                    "12px",
                                            }}
                                        >
                                            {
                                                manuscript.abstractText
                                            }
                                        </p>

                                        {/* =================================================
                                            AI ANALYSIS RESULT
                                        ================================================== */}

                                        {analysisResults[
                                            manuscript.id
                                        ] && (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "16px",
                                                        padding:
                                                            "24px",
                                                        border:
                                                            "1px solid #444",
                                                        borderRadius:
                                                            "10px",
                                                        backgroundColor:
                                                            "#17181f",
                                                    }}
                                                >
                                                    <h3
                                                        style={{
                                                            marginTop:
                                                                0,
                                                        }}
                                                    >
                                                        AI Manuscript
                                                        Analysis
                                                    </h3>

                                                    <p
                                                        style={{
                                                            marginTop:
                                                                "4px",
                                                            marginBottom:
                                                                "20px",
                                                            opacity:
                                                                0.75,
                                                            fontSize:
                                                                "14px",
                                                        }}
                                                    >
                                                        AI-powered
                                                        academic
                                                        analysis based
                                                        on the
                                                        manuscript
                                                        information
                                                        provided.
                                                    </p>

                                                    {/* Assessment */}

                                                    <h4>
                                                        Overall
                                                        Assessment
                                                    </h4>

                                                    <div
                                                        style={{
                                                            display:
                                                                "grid",
                                                            gridTemplateColumns:
                                                                "repeat(auto-fit, minmax(180px, 1fr))",
                                                            gap: "10px",
                                                            marginBottom:
                                                                "20px",
                                                        }}
                                                    >
                                                        <div>
                                                            <strong>
                                                                Abstract
                                                            </strong>

                                                            <p>
                                                                {
                                                                    analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ]
                                                                        .abstract_quality
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                Methodology
                                                            </strong>

                                                            <p>
                                                                {
                                                                    analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ]
                                                                        .methodology_quality
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                Results
                                                            </strong>

                                                            <p>
                                                                {
                                                                    analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ]
                                                                        .results_quality
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                Conclusion
                                                            </strong>

                                                            <p>
                                                                {
                                                                    analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ]
                                                                        .conclusion_quality
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                Writing
                                                                Quality
                                                            </strong>

                                                            <p>
                                                                {
                                                                    analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ]
                                                                        .writing_quality
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                Research
                                                                Relevance
                                                            </strong>

                                                            <p>
                                                                {
                                                                    analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ]
                                                                        .relevance
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Statistics */}

                                                    <h4>
                                                        Manuscript
                                                        Statistics
                                                    </h4>

                                                    <p>
                                                        <strong>
                                                            Abstract Word
                                                            Count:
                                                        </strong>{" "}
                                                        {
                                                            analysisResults[
                                                                manuscript
                                                                    .id
                                                            ]
                                                                .abstract_word_count
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Keyword
                                                            Count:
                                                        </strong>{" "}
                                                        {
                                                            analysisResults[
                                                                manuscript
                                                                    .id
                                                            ]
                                                                .keyword_count
                                                        }
                                                    </p>

                                                    {/* Missing Sections */}

                                                    {analysisResults[
                                                        manuscript.id
                                                    ]
                                                        .missing_sections
                                                        ?.length >
                                                        0 && (
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "20px",
                                                                }}
                                                            >
                                                                <h4>
                                                                    Missing /
                                                                    Weak
                                                                    Sections
                                                                </h4>

                                                                <ul>
                                                                    {analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ].missing_sections.map(
                                                                        (
                                                                            section,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                            >
                                                                                {
                                                                                    section
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}

                                                    {/* Writing Issues */}

                                                    {analysisResults[
                                                        manuscript.id
                                                    ]
                                                        .writing_issues
                                                        ?.length >
                                                        0 && (
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "20px",
                                                                }}
                                                            >
                                                                <h4>
                                                                    Writing
                                                                    Issues
                                                                </h4>

                                                                <ul>
                                                                    {analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ].writing_issues.map(
                                                                        (
                                                                            issue,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                            >
                                                                                {
                                                                                    issue
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}

                                                    {/* Suggestions */}

                                                    {analysisResults[
                                                        manuscript.id
                                                    ]
                                                        .suggestions
                                                        ?.length >
                                                        0 && (
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "20px",
                                                                }}
                                                            >
                                                                <h4>
                                                                    AI
                                                                    Suggestions
                                                                </h4>

                                                                <ol>
                                                                    {analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ].suggestions.map(
                                                                        (
                                                                            suggestion,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                style={{
                                                                                    marginBottom:
                                                                                        "8px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    suggestion
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ol>
                                                            </div>
                                                        )}

                                                    {/* Analysis Time */}

                                                    {(
                                                        analysisResults[
                                                            manuscript.id
                                                        ]
                                                            .analyzedAt ||
                                                        analysisResults[
                                                            manuscript.id
                                                        ]
                                                            .analyzed_at
                                                    ) && (
                                                            <p
                                                                style={{
                                                                    marginTop:
                                                                        "20px",
                                                                    fontSize:
                                                                        "13px",
                                                                    opacity:
                                                                        0.65,
                                                                }}
                                                            >
                                                                <strong>
                                                                    Analyzed
                                                                    At:
                                                                </strong>{" "}
                                                                {new Date(
                                                                    analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ]
                                                                        .analyzedAt ||
                                                                    analysisResults[
                                                                        manuscript
                                                                            .id
                                                                    ]
                                                                        .analyzed_at
                                                                ).toLocaleString()}
                                                            </p>
                                                        )}
                                                </div>
                                            )}

                                        {/* =================================================
                                            ACTION BUTTONS
                                        ================================================== */}

                                        <button
                                            onClick={() =>
                                                handleAnalyze(
                                                    manuscript.id
                                                )
                                            }
                                            disabled={
                                                analyzingId ===
                                                manuscript.id
                                            }
                                            style={{
                                                marginTop:
                                                    "12px",
                                                marginRight:
                                                    "10px",
                                            }}
                                        >
                                            {analyzingId ===
                                                manuscript.id
                                                ? "Analyzing..."
                                                : "Analyze with AI"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleCheckSimilarity(
                                                    manuscript.id
                                                )
                                            }
                                            disabled={
                                                checkingSimilarityId ===
                                                manuscript.id
                                            }
                                            style={{
                                                marginTop:
                                                    "12px",
                                                marginRight:
                                                    "10px",
                                            }}
                                        >
                                            {checkingSimilarityId ===
                                                manuscript.id
                                                ? "Checking..."
                                                : "Check Similarity"}
                                        </button>

                                        {/* =================================================
                                            SIMILARITY RESULT
                                        ================================================== */}

                                        {similarityResults[
                                            manuscript.id
                                        ] && (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "20px",
                                                        padding:
                                                            "20px",
                                                        border:
                                                            "1px solid #444",
                                                        borderRadius:
                                                            "10px",
                                                        backgroundColor:
                                                            "#17181f",
                                                    }}
                                                >
                                                    <h3
                                                        style={{
                                                            marginTop:
                                                                0,
                                                        }}
                                                    >
                                                        Manuscript
                                                        Similarity
                                                        Analysis
                                                    </h3>

                                                    <p>
                                                        <strong>
                                                            Similarity
                                                            Percentage:
                                                        </strong>{" "}
                                                        {
                                                            similarityResults[
                                                                manuscript.id
                                                            ]
                                                                .similarity_percentage ??
                                                            similarityResults[
                                                                manuscript.id
                                                            ]
                                                                .similarityPercentage ??
                                                            0
                                                        }
                                                        %
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Status:
                                                        </strong>{" "}
                                                        {
                                                            similarityResults[
                                                                manuscript.id
                                                            ]
                                                                .status
                                                        }
                                                    </p>

                                                    {similarityResults[
                                                        manuscript.id
                                                    ].matches
                                                        ?.length >
                                                        0 ? (
                                                        <div>
                                                            <h4>
                                                                Matching
                                                                Manuscripts
                                                            </h4>

                                                            <ul>
                                                                {similarityResults[
                                                                    manuscript
                                                                        .id
                                                                ].matches.map(
                                                                    (
                                                                        match
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                match.manuscript_id ??
                                                                                match.manuscriptId
                                                                            }
                                                                            style={{
                                                                                marginBottom:
                                                                                    "10px",
                                                                            }}
                                                                        >
                                                                            <strong>
                                                                                {
                                                                                    match.title
                                                                                }
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
                                                            No similar
                                                            manuscripts
                                                            were found.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                        {/* =================================================
                                            EDIT / SUBMIT / DELETE
                                        ================================================== */}

                                        {(manuscript.status ===
                                            "DRAFT" ||
                                            manuscript.status ===
                                            "REVISION_REQUIRED") && (
                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "10px",
                                                        marginTop:
                                                            "16px",
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
                                                            handleSubmit(
                                                                manuscript.id
                                                            )
                                                        }
                                                    >
                                                        Submit
                                                    </button>

                                                    {manuscript.status ===
                                                        "DRAFT" && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        manuscript.id
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                </div>
                                            )}
                                    </article>
                                )
                            )}
                        </div>
                    )}
            </section>
        </div>
    );
}

export default AuthorDashboard;