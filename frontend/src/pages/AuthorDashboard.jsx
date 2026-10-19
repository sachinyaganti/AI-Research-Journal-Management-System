import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./AuthorDashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://research-journal-backend-docker.onrender.com";

function AuthorDashboard() {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();

    // =========================================================
    // MANUSCRIPTS
    // =========================================================

    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // AI ANALYSIS
    // =========================================================

    const [analysisResults, setAnalysisResults] = useState({});
    const [analyzingId, setAnalyzingId] = useState(null);

    // =========================================================
    // SIMILARITY
    // =========================================================

    const [similarityResults, setSimilarityResults] = useState({});
    const [checkingSimilarityId, setCheckingSimilarityId] =
        useState(null);

    // =========================================================
    // PRE-PUBLICATION SCREENING
    // =========================================================

    const [screeningResults, setScreeningResults] = useState({});
    const [screeningId, setScreeningId] = useState(null);

    // =========================================================
    // PDF UPLOAD
    // =========================================================

    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedManuscriptId, setSelectedManuscriptId] =
        useState("");

    const [uploadingFile, setUploadingFile] = useState(false);
    const [fileUploadError, setFileUploadError] = useState("");
    const [fileUploadSuccess, setFileUploadSuccess] = useState("");

    // =========================================================
    // PDF VIEW
    // =========================================================

    const [openingPdfId, setOpeningPdfId] = useState(null);

    // =========================================================
    // REVISIONS & DECISION FEEDBACK
    // =========================================================

    const [revisionModalManuscript, setRevisionModalManuscript] = useState(null);
    const [revisionFile, setRevisionFile] = useState(null);
    const [responseNotes, setResponseNotes] = useState("");
    const [submittingRevision, setSubmittingRevision] = useState(false);
    const [revisionError, setRevisionError] = useState("");

    const [historyModalManuscript, setHistoryModalManuscript] = useState(null);
    const [revisionHistory, setRevisionHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [feedbackModalManuscript, setFeedbackModalManuscript] = useState(null);
    const [decisionRecord, setDecisionRecord] = useState(null);
    const [manuscriptReviews, setManuscriptReviews] = useState([]);
    const [loadingFeedback, setLoadingFeedback] = useState(false);

    const handleOpenFeedbackModal = async (manuscript) => {
        setFeedbackModalManuscript(manuscript);
        setLoadingFeedback(true);
        setDecisionRecord(null);
        setManuscriptReviews([]);
        try {
            const [decRes, revRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/manuscripts/${manuscript.id}/decision`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/manuscripts/${manuscript.id}/reviews`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            if (decRes.ok) {
                const decData = await decRes.json();
                setDecisionRecord(decData);
            }
            if (revRes.ok) {
                const revData = await revRes.json();
                setManuscriptReviews(Array.isArray(revData) ? revData : []);
            }
        } catch (e) {
            console.error("Failed to fetch decision feedback:", e);
        } finally {
            setLoadingFeedback(false);
        }
    };

    const handleOpenHistoryModal = async (manuscript) => {
        setHistoryModalManuscript(manuscript);
        setLoadingHistory(true);
        setRevisionHistory([]);
        try {
            const res = await fetch(`${API_BASE_URL}/api/manuscripts/${manuscript.id}/revisions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRevisionHistory(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Failed to fetch revision history:", e);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmitRevision = async (e) => {
        e.preventDefault();
        if (!revisionModalManuscript || !revisionFile) {
            setRevisionError("Please select a revised PDF file.");
            return;
        }
        setSubmittingRevision(true);
        setRevisionError("");
        try {
            const formData = new FormData();
            formData.append("file", revisionFile);
            formData.append("responseNotes", responseNotes);

            const res = await fetch(`${API_BASE_URL}/api/manuscripts/${revisionModalManuscript.id}/revisions`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to submit revision");
            }
            setRevisionModalManuscript(null);
            setRevisionFile(null);
            setResponseNotes("");
            await fetchManuscripts();
        } catch (err) {
            setRevisionError(err.message || "Failed to submit revision");
        } finally {
            setSubmittingRevision(false);
        }
    };

    // =========================================================
    // FETCH MANUSCRIPTS
    // =========================================================

    const fetchManuscripts = async () => {
        if (!token) {
            return;
        }

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

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response
                .json()
                .catch(() => []);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load manuscripts"
                );
            }

            setManuscripts(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Failed to fetch manuscripts:",
                err
            );

            setError(
                err.message ||
                "Failed to load manuscripts"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // IMPORTANT:
    // NO AI ANALYSIS IS LOADED HERE
    // =========================================================

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchManuscripts();
    }, [token]);

    // =========================================================
    // HANDLE PDF FILE SELECTION
    // =========================================================

    const handleFileSelection = (file) => {
        setFileUploadError("");
        setFileUploadSuccess("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        // PDF validation
        if (
            file.type !== "application/pdf" &&
            !file.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {
            setSelectedFile(null);

            setFileUploadError(
                "Only PDF files are allowed."
            );

            return;
        }

        // 10 MB limit
        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            setSelectedFile(null);

            setFileUploadError(
                "PDF file size must be 10 MB or less."
            );

            return;
        }

        setSelectedFile(file);
    };

    // =========================================================
    // UPLOAD RESEARCH PAPER PDF
    // =========================================================

    const handleFileUpload = async () => {
        setFileUploadError("");
        setFileUploadSuccess("");

        if (!selectedFile) {
            setFileUploadError(
                "Please select a research paper PDF."
            );

            return;
        }

        if (!selectedManuscriptId) {
            setFileUploadError(
                "Please select the manuscript to which this PDF belongs."
            );

            return;
        }

        setUploadingFile(true);

        try {
            const formData = new FormData();

            formData.append(
                "file",
                selectedFile
            );

            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${selectedManuscriptId}/file`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to upload research paper"
                );
            }

            setSelectedFile(null);

            setFileUploadSuccess(
                "Research paper uploaded successfully."
            );

            await fetchManuscripts();
        } catch (err) {
            console.error(
                "PDF upload error:",
                err
            );

            setFileUploadError(
                err.message ||
                "Failed to upload research paper"
            );
        } finally {
            setUploadingFile(false);
        }
    };

    // =========================================================
    // VIEW PDF
    // =========================================================

    const handleViewPdf = async (
        manuscriptId
    ) => {
        setOpeningPdfId(manuscriptId);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/file`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to open the research paper PDF."
                );
            }

            const blob =
                await response.blob();

            const pdfUrl =
                window.URL.createObjectURL(
                    blob
                );

            window.open(
                pdfUrl,
                "_blank",
                "noopener,noreferrer"
            );

            setTimeout(() => {
                window.URL.revokeObjectURL(
                    pdfUrl
                );
            }, 60000);
        } catch (err) {
            console.error(
                "PDF viewing error:",
                err
            );

            setError(
                err.message ||
                "Unable to open PDF"
            );
        } finally {
            setOpeningPdfId(null);
        }
    };

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
                        Authorization:
                            `Bearer ${token}`,
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
        const confirmed =
            window.confirm(
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
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete manuscript"
                );
            }

            if (
                String(
                    selectedManuscriptId
                ) === String(id)
            ) {
                setSelectedManuscriptId("");
                setSelectedFile(null);
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
    // IMPORTANT:
    // THIS FUNCTION RUNS ONLY WHEN THE BUTTON IS PRESSED
    // =========================================================

    const handleAnalyze = async (
        manuscriptId
    ) => {
        setError("");
        setAnalyzingId(manuscriptId);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/analyze`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to analyze manuscript"
                );
            }

            // Save result only after button click
            setAnalysisResults(
                (previous) => ({
                    ...previous,
                    [manuscriptId]:
                        normalizeAnalysis(
                            data
                        ),
                })
            );
        } catch (err) {
            console.error(
                "AI analysis error:",
                err
            );

            setError(
                err.message ||
                "Failed to analyze manuscript"
            );
        } finally {
            setAnalyzingId(null);
        }
    };

    // =========================================================
    // NORMALIZE AI RESPONSE
    // Supports Java camelCase + Python snake_case
    // =========================================================

    const normalizeAnalysis = (data) => {
        return {
            ...data,

            abstractWordCount:
                data.abstractWordCount ??
                data.abstract_word_count ??
                0,

            keywordCount:
                data.keywordCount ??
                data.keyword_count ??
                0,

            abstractQuality:
                data.abstractQuality ??
                data.abstract_quality ??
                "",

            methodologyQuality:
                data.methodologyQuality ??
                data.methodology_quality ??
                "",

            resultsQuality:
                data.resultsQuality ??
                data.results_quality ??
                "",

            conclusionQuality:
                data.conclusionQuality ??
                data.conclusion_quality ??
                "",

            writingQuality:
                data.writingQuality ??
                data.writing_quality ??
                "",

            missingSections:
                data.missingSections ??
                data.missing_sections ??
                [],

            writingIssues:
                data.writingIssues ??
                data.writing_issues ??
                [],

            suggestions:
                data.suggestions ?? [],

            analyzedAt:
                data.analyzedAt ??
                data.analyzed_at ??
                null,
        };
    };

    // =========================================================
    // SIMILARITY CHECK
    // IMPORTANT:
    // THIS ALSO RUNS ONLY WHEN BUTTON IS PRESSED
    // =========================================================

    const handleCheckSimilarity = async (
        manuscriptId
    ) => {
        setError("");
        setCheckingSimilarityId(
            manuscriptId
        );

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/similarity`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to check manuscript similarity"
                );
            }

            setSimilarityResults(
                (previous) => ({
                    ...previous,
                    [manuscriptId]:
                        data,
                })
            );
        } catch (err) {
            console.error(
                "Similarity error:",
                err
            );

            setError(
                err.message ||
                "Failed to check manuscript similarity"
            );
        } finally {
            setCheckingSimilarityId(
                null
            );
        }
    };

    // =========================================================
    // PRE-PUBLICATION SCREENING
    // Runs similarity + AI-content + quality analysis together
    // =========================================================

    const handlePrePublicationScreening = async (
        manuscriptId
    ) => {
        setError("");
        setScreeningId(manuscriptId);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/screen`,
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

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to run pre-publication screening"
                );
            }

            setScreeningResults(
                (previous) => ({
                    ...previous,
                    [manuscriptId]: data,
                })
            );

        } catch (err) {
            console.error(
                "Pre-publication screening error:",
                err
            );

            setError(
                err.message ||
                "Failed to run pre-publication screening"
            );
        } finally {
            setScreeningId(null);
        }
    };

    // =========================================================
    // SELECTED MANUSCRIPT
    // =========================================================

    const selectedManuscript =
        manuscripts.find(
            (manuscript) =>
                String(
                    manuscript.id
                ) ===
                String(
                    selectedManuscriptId
                )
        );

    // =========================================================
    // STATISTICS
    // =========================================================

    const draftCount =
        manuscripts.filter(
            (manuscript) =>
                manuscript.status ===
                "DRAFT"
        ).length;

    const submittedCount =
        manuscripts.filter(
            (manuscript) =>
                manuscript.status ===
                "SUBMITTED"
        ).length;

    const acceptedCount =
        manuscripts.filter(
            (manuscript) =>
                manuscript.status ===
                "ACCEPTED"
        ).length;

    const uploadedPdfCount =
        manuscripts.filter(
            (manuscript) =>
                Boolean(
                    manuscript.fileName
                )
        ).length;

    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (
        status
    ) => {
        switch (status) {
            case "ACCEPTED":
                return "status accepted";

            case "REJECTED":
                return "status rejected";

            case "SUBMITTED":
                return "status submitted";

            case "UNDER_REVIEW":
                return "status review";

            case "REVISION_REQUIRED":
                return "status revision";

            case "DRAFT":
            default:
                return "status draft";
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    if (loading) {
        return (
            <div className="loading-container">
                <h2>
                    Loading Author Dashboard...
                </h2>

                <p>
                    Please wait while your
                    manuscripts are loaded.
                </p>
            </div>
        );
    }

    return (
        <div className="author-dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="author-dashboard-header">

                <div>
                    <h1>
                        Author Dashboard
                    </h1>

                    <p>
                        Manage your research
                        manuscripts, submissions
                        and analysis.
                    </p>
                </div>

                <button
                    className="logout-button"
                    onClick={logout}
                >
                    Logout
                </button>

            </header>

            <main className="author-dashboard-content">

                {/* =================================================
                    GENERAL ERROR
                ================================================= */}

                {error && (
                    <div
                        className="error-message"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {/* =================================================
                    DASHBOARD STATISTICS
                ================================================= */}

                <section className="dashboard-stats">

                    <div className="stat-card">
                        <h3>
                            Total Manuscripts
                        </h3>

                        <p>
                            {manuscripts.length}
                        </p>
                    </div>

                    <div className="stat-card">
                        <h3>
                            Drafts
                        </h3>

                        <p>
                            {draftCount}
                        </p>
                    </div>

                    <div className="stat-card">
                        <h3>
                            Submitted
                        </h3>

                        <p>
                            {submittedCount}
                        </p>
                    </div>

                    <div className="stat-card">
                        <h3>
                            Accepted
                        </h3>

                        <p>
                            {acceptedCount}
                        </p>
                    </div>

                    <div className="stat-card">
                        <h3>
                            PDFs Uploaded
                        </h3>

                        <p>
                            {uploadedPdfCount}
                        </p>
                    </div>

                </section>

                {/* =================================================
                    RESEARCH MANUSCRIPTS HEADER
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>
                            <h2>
                                Research Manuscripts
                            </h2>

                            <p>
                                Create and manage
                                your research
                                manuscripts.
                            </p>
                        </div>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/author/manuscripts/new"
                                )
                            }
                        >
                            + New Manuscript
                        </button>

                    </div>

                </section>

                {/* =================================================
                    PDF MANAGEMENT
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>
                            <h2>
                                Research Paper PDF Upload
                            </h2>

                            <p>
                                Upload or replace
                                the PDF associated
                                with a manuscript.
                            </p>
                        </div>

                    </div>

                    <div className="pdf-management-card">

                        {/* SELECT MANUSCRIPT */}

                        <div className="form-group">

                            <label htmlFor="manuscript-select">
                                Select Manuscript
                            </label>

                            <select
                                id="manuscript-select"
                                value={
                                    selectedManuscriptId
                                }
                                onChange={(
                                    event
                                ) => {
                                    setSelectedManuscriptId(
                                        event
                                            .target
                                            .value
                                    );

                                    setSelectedFile(
                                        null
                                    );

                                    setFileUploadError(
                                        ""
                                    );

                                    setFileUploadSuccess(
                                        ""
                                    );
                                }}
                            >

                                <option value="">
                                    -- Select
                                    Manuscript --
                                </option>

                                {manuscripts.map(
                                    (
                                        manuscript
                                    ) => (
                                        <option
                                            key={
                                                manuscript.id
                                            }
                                            value={
                                                manuscript.id
                                            }
                                        >
                                            #
                                            {
                                                manuscript.id
                                            }{" "}
                                            -{" "}
                                            {
                                                manuscript.title
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                        </div>

                        {/* CURRENT FILE */}

                        <div className="selected-file-box">

                            <strong>
                                Selected Manuscript:
                            </strong>

                            <p>
                                {selectedManuscript
                                    ? selectedManuscript.title
                                    : "No manuscript selected"}
                            </p>

                            {selectedManuscript && (
                                <>

                                    <strong>
                                        Current PDF:
                                    </strong>

                                    <p>
                                        {selectedManuscript.fileName ||
                                            "No PDF uploaded"}
                                    </p>

                                    {selectedManuscript.fileSize && (
                                        <p>
                                            File Size:{" "}
                                            {(
                                                selectedManuscript.fileSize /
                                                1024 /
                                                1024
                                            ).toFixed(
                                                2
                                            )}{" "}
                                            MB
                                        </p>
                                    )}

                                </>
                            )}

                        </div>

                        {/* FILE SELECT */}

                        <div className="form-group">

                            <label htmlFor="research-paper-file">
                                Select PDF
                            </label>

                            <input
                                id="research-paper-file"
                                type="file"
                                accept=".pdf,application/pdf"
                                disabled={
                                    uploadingFile
                                }
                                onChange={(
                                    event
                                ) => {
                                    const file =
                                        event
                                            .target
                                            .files?.[0];

                                    handleFileSelection(
                                        file
                                    );

                                    event.target.value =
                                        "";
                                }}
                            />

                            <small>
                                PDF only.
                                Maximum file
                                size: 10 MB.
                            </small>

                        </div>

                        {/* SELECTED FILE */}

                        {selectedFile && (
                            <div className="selected-file-box">

                                <strong>
                                    Selected PDF
                                </strong>

                                <p>
                                    {selectedFile.name}
                                </p>

                                <small>
                                    {(
                                        selectedFile.size /
                                        1024 /
                                        1024
                                    ).toFixed(
                                        2
                                    )}{" "}
                                    MB
                                </small>

                            </div>
                        )}

                        {/* UPLOAD BUTTON */}

                        <div>

                            <button
                                className="primary-button"
                                type="button"
                                onClick={
                                    handleFileUpload
                                }
                                disabled={
                                    uploadingFile ||
                                    !selectedFile ||
                                    !selectedManuscriptId
                                }
                            >
                                {uploadingFile
                                    ? "Uploading..."
                                    : selectedManuscript?.fileName
                                        ? "Replace PDF"
                                        : "Upload PDF"}
                            </button>

                            {selectedManuscript?.fileName && (
                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={() =>
                                        handleViewPdf(
                                            selectedManuscript.id
                                        )
                                    }
                                    disabled={
                                        openingPdfId ===
                                        selectedManuscript.id
                                    }
                                    style={{
                                        marginLeft:
                                            "10px",
                                    }}
                                >
                                    {openingPdfId ===
                                        selectedManuscript.id
                                        ? "Opening..."
                                        : "View Current PDF"}
                                </button>
                            )}

                        </div>

                    </div>

                    {fileUploadError && (
                        <div className="error-message">
                            {fileUploadError}
                        </div>
                    )}

                    {fileUploadSuccess && (
                        <div className="success-message">
                            ✓{" "}
                            {
                                fileUploadSuccess
                            }
                        </div>
                    )}

                </section>

                {/* =================================================
                    MY MANUSCRIPTS
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>
                            <h2>
                                My Manuscripts
                            </h2>

                            <p>
                                View your
                                manuscripts and
                                manage their
                                workflow.
                            </p>
                        </div>

                    </div>

                    {manuscripts.length ===
                        0 && (
                            <div className="empty-state">

                                <p>
                                    You haven't
                                    created any
                                    manuscripts
                                    yet.
                                </p>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/author/manuscripts/new"
                                        )
                                    }
                                >
                                    Create Manuscript
                                </button>

                            </div>
                        )}

                    {manuscripts.length >
                        0 && (
                            <div className="manuscripts-grid">

                                {manuscripts.map(
                                    (
                                        manuscript
                                    ) => {

                                        const analysis =
                                            analysisResults[
                                            manuscript.id
                                            ];

                                        const similarity =
                                            similarityResults[
                                            manuscript.id
                                            ];
                                        const screening =
                                            screeningResults[
                                            manuscript.id
                                            ];

                                        return (
                                            <article
                                                className="manuscript-card"
                                                key={
                                                    manuscript.id
                                                }
                                            >

                                                {/* =================================================
                                                HEADER
                                            ================================================= */}

                                                <div className="manuscript-card-header">

                                                    <div>

                                                        <span className="manuscript-id">
                                                            Manuscript #
                                                            {
                                                                manuscript.id
                                                            }
                                                        </span>

                                                        <h3>
                                                            {
                                                                manuscript.title
                                                            }
                                                        </h3>

                                                    </div>

                                                    <span
                                                        className={getStatusClass(
                                                            manuscript.status
                                                        )}
                                                    >
                                                        {
                                                            manuscript.status
                                                        }
                                                    </span>

                                                </div>

                                                {/* =================================================
                                                DETAILS
                                            ================================================= */}

                                                <div className="manuscript-details">

                                                    <p>
                                                        <strong>
                                                            Category:
                                                        </strong>{" "}
                                                        {
                                                            manuscript.category ||
                                                            "Not specified"
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Keywords:
                                                        </strong>{" "}
                                                        {
                                                            manuscript.keywords ||
                                                            "Not specified"
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Abstract:
                                                        </strong>
                                                    </p>

                                                    <p className="abstract-preview">
                                                        {
                                                            manuscript.abstractText ||
                                                            "No abstract available."
                                                        }
                                                    </p>

                                                </div>

                                                {/* =================================================
                                                PDF INFORMATION
                                            ================================================= */}

                                                <div className="pdf-info">

                                                    <h4>
                                                        Research Paper PDF
                                                    </h4>

                                                    {manuscript.fileName ? (
                                                        <>
                                                            <p>
                                                                <strong>
                                                                    File:
                                                                </strong>{" "}
                                                                {
                                                                    manuscript.fileName
                                                                }
                                                            </p>

                                                            {manuscript.fileSize && (
                                                                <p>
                                                                    <strong>
                                                                        Size:
                                                                    </strong>{" "}
                                                                    {(
                                                                        manuscript.fileSize /
                                                                        1024 /
                                                                        1024
                                                                    ).toFixed(
                                                                        2
                                                                    )}{" "}
                                                                    MB
                                                                </p>
                                                            )}

                                                            <button
                                                                className="secondary-button"
                                                                onClick={() =>
                                                                    handleViewPdf(
                                                                        manuscript.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    openingPdfId ===
                                                                    manuscript.id
                                                                }
                                                            >
                                                                {openingPdfId ===
                                                                    manuscript.id
                                                                    ? "Opening..."
                                                                    : "View PDF"}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <p>
                                                            No PDF
                                                            uploaded.
                                                            Use the
                                                            PDF
                                                            Management
                                                            section
                                                            above.
                                                        </p>
                                                    )}

                                                </div>

                                                {/* =================================================
                                                    EDITORIAL DECISION & REVISION WORKFLOW
                                                ================================================= */}
                                                <div style={{
                                                    margin: "16px 0",
                                                    padding: "16px 20px",
                                                    borderRadius: "10px",
                                                    background: manuscript.status === "REVISION_REQUIRED"
                                                        ? "rgba(245, 158, 11, 0.1)"
                                                        : manuscript.status === "PUBLISHED"
                                                            ? "rgba(16, 185, 129, 0.1)"
                                                            : manuscript.status === "ACCEPTED"
                                                                ? "rgba(99, 102, 241, 0.1)"
                                                                : "rgba(255, 255, 255, 0.03)",
                                                    border: `1px solid ${manuscript.status === "REVISION_REQUIRED"
                                                            ? "rgba(245, 158, 11, 0.3)"
                                                            : manuscript.status === "PUBLISHED"
                                                                ? "rgba(16, 185, 129, 0.3)"
                                                                : manuscript.status === "ACCEPTED"
                                                                    ? "rgba(99, 102, 241, 0.3)"
                                                                    : "rgba(255, 255, 255, 0.06)"
                                                        }`
                                                }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                                                        <h4 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>
                                                            Editorial Status & Peer-Review Actions
                                                        </h4>
                                                        <span className={`badge ${manuscript.status === "PUBLISHED" || manuscript.status === "ACCEPTED"
                                                                ? "badge-accepted"
                                                                : manuscript.status === "REVISION_REQUIRED"
                                                                    ? "badge-revision"
                                                                    : "badge-submitted"
                                                            }`}>
                                                            {manuscript.status.replaceAll("_", " ")}
                                                        </span>
                                                    </div>

                                                    {manuscript.status === "PUBLISHED" && (
                                                        <div style={{ fontSize: "0.88rem", color: "#6ee7b7", marginBottom: "12px" }}>
                                                            🌟 <strong>Published Open-Access Article:</strong> Volume {manuscript.volume || "1"}, Issue {manuscript.issue || "1"}
                                                            {manuscript.doi && (
                                                                <span style={{ marginLeft: "10px", fontFamily: "monospace", color: "#38bdf8" }}>
                                                                    DOI: {manuscript.doi}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {manuscript.status === "ACCEPTED" && (
                                                        <p style={{ fontSize: "0.88rem", color: "#93c5fd", margin: "0 0 12px 0" }}>
                                                            ✓ Your manuscript has been formally accepted by the editorial board and is being prepared for volume release.
                                                        </p>
                                                    )}

                                                    {manuscript.status === "REVISION_REQUIRED" && (
                                                        <p style={{ fontSize: "0.88rem", color: "#fcd34d", margin: "0 0 12px 0" }}>
                                                            ⚠️ Revisions have been requested by the handling editor. Please review the blinded reviewer critiques and editor instructions, then submit your revised PDF and response notes.
                                                        </p>
                                                    )}

                                                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                                        {(manuscript.status === "REVISION_REQUIRED" || manuscript.status === "ACCEPTED" || manuscript.status === "REJECTED") && (
                                                            <button
                                                                type="button"
                                                                className="secondary-button"
                                                                onClick={() => handleOpenFeedbackModal(manuscript)}
                                                                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                                                            >
                                                                📋 View Decision & Reviewer Feedback
                                                            </button>
                                                        )}

                                                        {manuscript.status === "REVISION_REQUIRED" && (
                                                            <button
                                                                type="button"
                                                                className="primary-button"
                                                                onClick={() => {
                                                                    setRevisionModalManuscript(manuscript);
                                                                    setRevisionFile(null);
                                                                    setResponseNotes("");
                                                                    setRevisionError("");
                                                                }}
                                                                style={{ padding: "6px 16px", fontSize: "0.82rem", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                                                            >
                                                                🔄 Submit Revised Manuscript
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="secondary-button"
                                                            onClick={() => handleOpenHistoryModal(manuscript)}
                                                            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                                                        >
                                                            📜 Revision History
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* =================================================
                                                AI ANALYSIS
                                                HIDDEN UNTIL BUTTON IS PRESSED
                                            ================================================= */}

                                                <div className="ai-analysis-section">

                                                    <div className="analysis-header">

                                                        <h4>
                                                            AI Manuscript
                                                            Analysis
                                                        </h4>

                                                        <button
                                                            className="primary-button"
                                                            onClick={() =>
                                                                handleAnalyze(
                                                                    manuscript.id
                                                                )
                                                            }
                                                            disabled={
                                                                analyzingId ===
                                                                manuscript.id
                                                            }
                                                        >
                                                            {analyzingId ===
                                                                manuscript.id
                                                                ? "Analyzing..."
                                                                : "Analyze with AI"}
                                                        </button>

                                                    </div>

                                                    {!analysis &&
                                                        analyzingId !==
                                                        manuscript.id && (
                                                            <div className="analysis-placeholder">
                                                                Click{" "}
                                                                <strong>
                                                                    Analyze with AI
                                                                </strong>{" "}
                                                                to analyze this
                                                                manuscript.
                                                            </div>
                                                        )}

                                                    {analyzingId ===
                                                        manuscript.id && (
                                                            <div className="analysis-placeholder">
                                                                <span className="analysis-spinner">
                                                                    ⟳
                                                                </span>{" "}
                                                                Analyzing
                                                                manuscript
                                                                with AI...
                                                            </div>
                                                        )}

                                                    {analysis && (
                                                        <div className="ai-analysis-content">

                                                            {/* QUALITY */}

                                                            <h5>
                                                                Overall
                                                                Assessment
                                                            </h5>

                                                            <div className="analysis-quality-grid">

                                                                <div className="quality-card">
                                                                    <strong>
                                                                        Abstract
                                                                        Quality
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            analysis.abstractQuality
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="quality-card">
                                                                    <strong>
                                                                        Methodology
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            analysis.methodologyQuality
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="quality-card">
                                                                    <strong>
                                                                        Results
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            analysis.resultsQuality
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="quality-card">
                                                                    <strong>
                                                                        Conclusion
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            analysis.conclusionQuality
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="quality-card">
                                                                    <strong>
                                                                        Writing
                                                                        Quality
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            analysis.writingQuality
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="quality-card">
                                                                    <strong>
                                                                        Relevance
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            analysis.relevance
                                                                        }
                                                                    </span>
                                                                </div>

                                                            </div>

                                                            {/* STATISTICS */}

                                                            <div className="analysis-statistics">

                                                                <div className="analysis-stat-card">

                                                                    <strong>
                                                                        Abstract
                                                                        Word Count
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            analysis.abstractWordCount
                                                                        }
                                                                    </span>

                                                                </div>

                                                                <div className="analysis-stat-card">

                                                                    <strong>
                                                                        Keyword
                                                                        Count
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            analysis.keywordCount
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                            {/* MISSING SECTIONS */}

                                                            {analysis
                                                                .missingSections
                                                                ?.length >
                                                                0 && (
                                                                    <div className="analysis-list">

                                                                        <h5>
                                                                            Missing
                                                                            Sections
                                                                        </h5>

                                                                        <ul>
                                                                            {analysis.missingSections.map(
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

                                                            {/* WRITING ISSUES */}

                                                            {analysis
                                                                .writingIssues
                                                                ?.length >
                                                                0 && (
                                                                    <div className="analysis-list">

                                                                        <h5>
                                                                            Writing
                                                                            Issues
                                                                        </h5>

                                                                        <ul>
                                                                            {analysis.writingIssues.map(
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

                                                            {/* SUGGESTIONS */}

                                                            {analysis
                                                                .suggestions
                                                                ?.length >
                                                                0 && (
                                                                    <div className="analysis-list">

                                                                        <h5>
                                                                            AI
                                                                            Suggestions
                                                                        </h5>

                                                                        <ol>
                                                                            {analysis.suggestions.map(
                                                                                (
                                                                                    suggestion,
                                                                                    index
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            index
                                                                                        }
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

                                                            {/* ANALYSIS TIME */}

                                                            {analysis.analyzedAt && (
                                                                <p className="analysis-last-run">
                                                                    Last
                                                                    analyzed:{" "}
                                                                    {new Date(
                                                                        analysis.analyzedAt
                                                                    ).toLocaleString()}
                                                                </p>
                                                            )}

                                                        </div>
                                                    )}

                                                </div>

                                                {/* =================================================
                                                SIMILARITY
                                            ================================================= */}

                                                <div className="similarity-section">

                                                    <div className="similarity-header">

                                                        <h4>
                                                            Manuscript
                                                            Similarity
                                                            Check
                                                        </h4>

                                                        <button
                                                            className="secondary-button"
                                                            onClick={() =>
                                                                handleCheckSimilarity(
                                                                    manuscript.id
                                                                )
                                                            }
                                                            disabled={
                                                                checkingSimilarityId ===
                                                                manuscript.id
                                                            }
                                                        >
                                                            {checkingSimilarityId ===
                                                                manuscript.id
                                                                ? "Checking..."
                                                                : "Check Similarity"}
                                                        </button>

                                                    </div>

                                                    {!similarity &&
                                                        checkingSimilarityId !==
                                                        manuscript.id && (
                                                            <div className="analysis-placeholder">
                                                                Click{" "}
                                                                <strong>
                                                                    Check Similarity
                                                                </strong>{" "}
                                                                to compare this
                                                                manuscript with
                                                                other manuscripts.
                                                            </div>
                                                        )}

                                                    {checkingSimilarityId ===
                                                        manuscript.id && (
                                                            <div className="analysis-placeholder">
                                                                <span className="analysis-spinner">
                                                                    ⟳
                                                                </span>{" "}
                                                                Checking
                                                                manuscript
                                                                similarity...
                                                            </div>
                                                        )}

                                                    {similarity && (
                                                        <>
                                                            <div className="similarity-score">

                                                                <strong>
                                                                    Similarity:
                                                                </strong>

                                                                <span>
                                                                    {Number(
                                                                        similarity.similarity_percentage ??
                                                                        similarity.similarityPercentage ??
                                                                        0
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </span>

                                                            </div>

                                                            <div className="similarity-score">

                                                                <strong>
                                                                    Status:
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        similarity.status
                                                                    }
                                                                </span>

                                                            </div>

                                                            {similarity.matches
                                                                ?.length >
                                                                0 ? (
                                                                <div className="similarity-matches">

                                                                    <h5>
                                                                        Matching
                                                                        Manuscripts
                                                                    </h5>

                                                                    {similarity.matches.map(
                                                                        (
                                                                            match
                                                                        ) => (
                                                                            <div
                                                                                className="similarity-match"
                                                                                key={
                                                                                    match.manuscript_id ??
                                                                                    match.manuscriptId
                                                                                }
                                                                            >

                                                                                <div>

                                                                                    <strong>
                                                                                        {
                                                                                            match.title
                                                                                        }
                                                                                    </strong>

                                                                                </div>

                                                                                <span>
                                                                                    {Number(
                                                                                        match.similarity_percentage ??
                                                                                        match.similarityPercentage ??
                                                                                        0
                                                                                    ).toFixed(
                                                                                        2
                                                                                    )}
                                                                                    %
                                                                                </span>

                                                                            </div>
                                                                        )
                                                                    )}

                                                                </div>
                                                            ) : (
                                                                <p>
                                                                    No similar
                                                                    manuscripts
                                                                    were found.
                                                                </p>
                                                            )}

                                                            {similarity.analyzedAt && (
                                                                <p className="analysis-last-run">
                                                                    Checked:{" "}
                                                                    {new Date(
                                                                        similarity.analyzedAt
                                                                    ).toLocaleString()}
                                                                </p>
                                                            )}

                                                        </>
                                                    )}

                                                </div>

                                                {/* =================================================
                                                ACTIONS
                                            ================================================= */}

                                                <div className="manuscript-actions">

                                                    {(manuscript.status ===
                                                        "DRAFT" ||
                                                        manuscript.status ===
                                                        "REVISION_REQUIRED") && (
                                                            <>
                                                                <button
                                                                    className="secondary-button"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/author/manuscripts/${manuscript.id}/edit`
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    className="primary-button"
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
                                                                            className="danger-button"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    manuscript.id
                                                                                )
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                            </>
                                                        )}

                                                    {manuscript.status ===
                                                        "ACCEPTED" && (
                                                            <span className="accepted-message">
                                                                ✓ Manuscript
                                                                Accepted
                                                            </span>
                                                        )}

                                                    {manuscript.status ===
                                                        "REJECTED" && (
                                                            <span className="rejected-message">
                                                                Manuscript
                                                                Rejected
                                                            </span>
                                                        )}

                                                </div>
                                                {/* =================================================
    PRE-PUBLICATION SCREENING
================================================= */}

                                                <div className="screening-section">

                                                    <div className="screening-header">

                                                        <div>
                                                            <h4>
                                                                Pre-Publication Screening
                                                            </h4>

                                                            <p>
                                                                Run similarity, AI-content and
                                                                manuscript quality checks together.
                                                            </p>
                                                        </div>

                                                        <button
                                                            className="primary-button"
                                                            onClick={() =>
                                                                handlePrePublicationScreening(
                                                                    manuscript.id
                                                                )
                                                            }
                                                            disabled={
                                                                screeningId === manuscript.id ||
                                                                !manuscript.fileName
                                                            }
                                                        >
                                                            {screeningId === manuscript.id
                                                                ? "Screening..."
                                                                : "Run Screening"}
                                                        </button>

                                                    </div>

                                                    {!manuscript.fileName && (
                                                        <div className="analysis-placeholder">
                                                            Upload a research paper PDF before
                                                            running pre-publication screening.
                                                        </div>
                                                    )}

                                                    {screeningId === manuscript.id && (
                                                        <div className="analysis-placeholder">

                                                            <span className="analysis-spinner">
                                                                ⟳
                                                            </span>

                                                            {" "}
                                                            Running pre-publication screening...
                                                        </div>
                                                    )}

                                                    {screening && (
                                                        <div className="screening-results">

                                                            <div className="screening-status">
                                                                <strong>
                                                                    Screening Status:
                                                                </strong>

                                                                <span>
                                                                    {screening.screeningStatus}
                                                                </span>
                                                            </div>

                                                            {/* SIMILARITY */}

                                                            {screening.similarity && (
                                                                <div className="screening-result-card">

                                                                    <h5>
                                                                        Similarity Screening
                                                                    </h5>

                                                                    <div className="screening-metric">

                                                                        <strong>
                                                                            Similarity:
                                                                        </strong>

                                                                        <span>
                                                                            {Number(
                                                                                screening.similarity
                                                                                    .similarity_percentage ??
                                                                                screening.similarity
                                                                                    .similarityPercentage ??
                                                                                0
                                                                            ).toFixed(2)}
                                                                            %
                                                                        </span>

                                                                    </div>

                                                                    <div className="screening-metric">

                                                                        <strong>
                                                                            Status:
                                                                        </strong>

                                                                        <span>
                                                                            {screening.similarity.status}
                                                                        </span>

                                                                    </div>

                                                                    {screening.similarity.matches
                                                                        ?.length > 0 && (
                                                                            <div className="screening-matches">

                                                                                <strong>
                                                                                    Matching Manuscripts
                                                                                </strong>

                                                                                <ul>
                                                                                    {screening.similarity.matches.map(
                                                                                        (match) => (
                                                                                            <li
                                                                                                key={
                                                                                                    match.manuscript_id ??
                                                                                                    match.manuscriptId
                                                                                                }
                                                                                            >
                                                                                                {match.title} —{" "}
                                                                                                {Number(
                                                                                                    match.similarity_percentage ??
                                                                                                    match.similarityPercentage ??
                                                                                                    0
                                                                                                ).toFixed(2)}
                                                                                                %
                                                                                            </li>
                                                                                        )
                                                                                    )}
                                                                                </ul>

                                                                            </div>
                                                                        )}

                                                                </div>
                                                            )}

                                                            {/* AI CONTENT */}

                                                            {screening.aiContent && (
                                                                <div className="screening-result-card">

                                                                    <h5>
                                                                        AI-Content Assessment
                                                                    </h5>

                                                                    <div className="screening-metric">
                                                                        <strong>
                                                                            AI-Content Indicator:
                                                                        </strong>

                                                                        <span>
                                                                            {Number(
                                                                                screening.aiContent
                                                                                    .aiContentIndicator ?? 0
                                                                            ).toFixed(1)}
                                                                            %
                                                                        </span>
                                                                    </div>

                                                                    <div className="screening-metric">
                                                                        <strong>
                                                                            Human-Writing Indicator:
                                                                        </strong>

                                                                        <span>
                                                                            {Number(
                                                                                screening.aiContent
                                                                                    .humanWritingIndicator ?? 0
                                                                            ).toFixed(1)}
                                                                            %
                                                                        </span>
                                                                    </div>

                                                                    <div className="screening-metric">
                                                                        <strong>
                                                                            Confidence:
                                                                        </strong>

                                                                        <span>
                                                                            {screening.aiContent.confidence}
                                                                        </span>
                                                                    </div>

                                                                    {screening.aiContent.signals && (
                                                                        <div className="screening-text-block">

                                                                            <strong>
                                                                                Detected Signals
                                                                            </strong>

                                                                            <p>
                                                                                {screening.aiContent.signals}
                                                                            </p>

                                                                        </div>
                                                                    )}

                                                                    {screening.aiContent.explanation && (
                                                                        <div className="screening-text-block">

                                                                            <strong>
                                                                                Explanation
                                                                            </strong>

                                                                            <p>
                                                                                {screening.aiContent.explanation}
                                                                            </p>

                                                                        </div>
                                                                    )}

                                                                </div>
                                                            )}

                                                            {/* QUALITY */}

                                                            {screening.qualityAnalysis && (
                                                                <div className="screening-result-card">

                                                                    <h5>
                                                                        Manuscript Quality Analysis
                                                                    </h5>

                                                                    <div className="screening-quality-grid">

                                                                        <div>
                                                                            <strong>
                                                                                Abstract
                                                                            </strong>
                                                                            <span>
                                                                                {
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .abstract_quality ??
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .abstractQuality
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div>
                                                                            <strong>
                                                                                Methodology
                                                                            </strong>
                                                                            <span>
                                                                                {
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .methodology_quality ??
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .methodologyQuality
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div>
                                                                            <strong>
                                                                                Results
                                                                            </strong>
                                                                            <span>
                                                                                {
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .results_quality ??
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .resultsQuality
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div>
                                                                            <strong>
                                                                                Conclusion
                                                                            </strong>
                                                                            <span>
                                                                                {
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .conclusion_quality ??
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .conclusionQuality
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div>
                                                                            <strong>
                                                                                Writing
                                                                            </strong>
                                                                            <span>
                                                                                {
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .writing_quality ??
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .writingQuality
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                        <div>
                                                                            <strong>
                                                                                Relevance
                                                                            </strong>
                                                                            <span>
                                                                                {
                                                                                    screening
                                                                                        .qualityAnalysis
                                                                                        .relevance
                                                                                }
                                                                            </span>
                                                                        </div>

                                                                    </div>

                                                                    {screening.qualityAnalysis
                                                                        .missing_sections
                                                                        ?.length > 0 && (
                                                                            <div className="screening-text-block">

                                                                                <strong>
                                                                                    Missing Sections
                                                                                </strong>

                                                                                <ul>
                                                                                    {screening.qualityAnalysis
                                                                                        .missing_sections
                                                                                        .map(
                                                                                            (
                                                                                                section,
                                                                                                index
                                                                                            ) => (
                                                                                                <li key={index}>
                                                                                                    {section}
                                                                                                </li>
                                                                                            )
                                                                                        )}
                                                                                </ul>

                                                                            </div>
                                                                        )}

                                                                    {screening.qualityAnalysis
                                                                        .suggestions
                                                                        ?.length > 0 && (
                                                                            <div className="screening-text-block">

                                                                                <strong>
                                                                                    Improvement Suggestions
                                                                                </strong>

                                                                                <ol>
                                                                                    {screening.qualityAnalysis
                                                                                        .suggestions
                                                                                        .map(
                                                                                            (
                                                                                                suggestion,
                                                                                                index
                                                                                            ) => (
                                                                                                <li key={index}>
                                                                                                    {suggestion}
                                                                                                </li>
                                                                                            )
                                                                                        )}
                                                                                </ol>

                                                                            </div>
                                                                        )}

                                                                </div>
                                                            )}

                                                            <p className="analysis-last-run">
                                                                {screening.message}
                                                            </p>

                                                        </div>
                                                    )}

                                                </div>
                                            </article>
                                        );
                                    }
                                )}

                            </div>
                        )}

                </section>

                {/* =================================================
                    MODAL: SUBMIT REVISED MANUSCRIPT
                ================================================= */}
                {revisionModalManuscript && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            zIndex: 1000,
                            backdropFilter: "blur(6px)"
                        }}
                    >
                        <div
                            className="card"
                            style={{
                                maxWidth: "640px",
                                width: "100%",
                                padding: "32px",
                                textAlign: "left"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ margin: 0, fontSize: "1.3rem" }}>
                                    Submit Revised Manuscript
                                </h3>
                                <button
                                    onClick={() => setRevisionModalManuscript(null)}
                                    style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.3rem", cursor: "pointer" }}
                                >
                                    ✕
                                </button>
                            </div>

                            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                                Submitting revision for: <strong>{revisionModalManuscript.title}</strong>
                            </p>

                            {revisionError && (
                                <div
                                    className="card"
                                    style={{
                                        borderColor: "rgba(239, 68, 68, 0.4)",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        color: "#fca5a5",
                                        padding: "12px 16px",
                                        marginBottom: "16px",
                                        fontSize: "0.85rem"
                                    }}
                                >
                                    ✕ {revisionError}
                                </div>
                            )}

                            <form onSubmit={handleSubmitRevision} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                                        Upload Revised Manuscript PDF: <span style={{ color: "#f87171" }}>*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        required
                                        className="form-input"
                                        onChange={(e) => setRevisionFile(e.target.files?.[0] || null)}
                                    />
                                    <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                                        PDF format only. Maximum 10 MB.
                                    </small>
                                </div>

                                <div>
                                    <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                                        Author Response to Reviewers & Editor:
                                    </label>
                                    <textarea
                                        className="form-input"
                                        rows={6}
                                        placeholder="Detail point-by-point the specific revisions, amendments, and responses made to reviewer comments..."
                                        value={responseNotes}
                                        onChange={(e) => setResponseNotes(e.target.value)}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                                    <button
                                        type="button"
                                        onClick={() => setRevisionModalManuscript(null)}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingRevision || !revisionFile}
                                        className="btn btn-primary"
                                        style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                                    >
                                        {submittingRevision ? "Uploading Revision..." : "Upload & Submit Revision"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* =================================================
                    MODAL: REVISION HISTORY
                ================================================= */}
                {historyModalManuscript && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            zIndex: 1000,
                            backdropFilter: "blur(6px)"
                        }}
                    >
                        <div
                            className="card"
                            style={{
                                maxWidth: "700px",
                                width: "100%",
                                padding: "32px",
                                textAlign: "left",
                                maxHeight: "85vh",
                                overflowY: "auto"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ margin: 0, fontSize: "1.3rem" }}>
                                    Revision History
                                </h3>
                                <button
                                    onClick={() => setHistoryModalManuscript(null)}
                                    style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.3rem", cursor: "pointer" }}
                                >
                                    ✕
                                </button>
                            </div>

                            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
                                Archived versions for: <strong>{historyModalManuscript.title}</strong>
                            </p>

                            {loadingHistory && (
                                <p style={{ color: "var(--text-secondary)" }}>Loading version archive...</p>
                            )}

                            {!loadingHistory && revisionHistory.length === 0 && (
                                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    No previous archived revisions. The current PDF is the initial submission (v1).
                                </p>
                            )}

                            {!loadingHistory && revisionHistory.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {revisionHistory.map((rev) => (
                                        <div
                                            key={rev.id}
                                            style={{
                                                padding: "16px",
                                                background: "rgba(255, 255, 255, 0.03)",
                                                borderRadius: "8px",
                                                border: "1px solid rgba(255, 255, 255, 0.08)"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                <span className="badge badge-submitted">
                                                    Version {rev.versionNumber}
                                                </span>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                    {rev.uploadedAt ? new Date(rev.uploadedAt).toLocaleString() : ""}
                                                </span>
                                            </div>
                                            {rev.fileName && (
                                                <p style={{ margin: "0 0 6px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                                    <strong>File:</strong> {rev.fileName}
                                                </p>
                                            )}
                                            {rev.responseNotes && (
                                                <div style={{ marginTop: "8px" }}>
                                                    <strong style={{ fontSize: "0.82rem", color: "var(--accent-primary)" }}>
                                                        Author Response Notes:
                                                    </strong>
                                                    <p style={{ margin: "4px 0 0 0", fontSize: "0.88rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                                                        {rev.responseNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                                <button
                                    type="button"
                                    onClick={() => setHistoryModalManuscript(null)}
                                    className="btn btn-secondary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================================================
                    MODAL: EDITORIAL DECISION & REVIEWER FEEDBACK
                ================================================= */}
                {feedbackModalManuscript && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            zIndex: 1000,
                            backdropFilter: "blur(6px)"
                        }}
                    >
                        <div
                            className="card"
                            style={{
                                maxWidth: "800px",
                                width: "100%",
                                padding: "32px",
                                textAlign: "left",
                                maxHeight: "85vh",
                                overflowY: "auto"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ margin: 0, fontSize: "1.3rem" }}>
                                    Editorial Decision & Peer Feedback
                                </h3>
                                <button
                                    onClick={() => setFeedbackModalManuscript(null)}
                                    style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "1.3rem", cursor: "pointer" }}
                                >
                                    ✕
                                </button>
                            </div>

                            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
                                Manuscript: <strong>{feedbackModalManuscript.title}</strong>
                            </p>

                            {loadingFeedback && (
                                <p style={{ color: "var(--text-secondary)" }}>Loading decision dossier...</p>
                            )}

                            {!loadingFeedback && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    {/* Editor Decision Section */}
                                    {decisionRecord ? (
                                        <div
                                            style={{
                                                padding: "20px",
                                                borderRadius: "10px",
                                                background: "rgba(99, 102, 241, 0.08)",
                                                border: "1px solid rgba(99, 102, 241, 0.25)"
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span className="badge badge-revision">
                                                        EDITOR DECISION
                                                    </span>
                                                    <strong style={{ color: "#fff" }}>
                                                        {decisionRecord.decision}
                                                    </strong>
                                                </div>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                    {decisionRecord.decidedAt ? new Date(decisionRecord.decidedAt).toLocaleString() : ""}
                                                </span>
                                            </div>

                                            {decisionRecord.comments ? (
                                                <div>
                                                    <h4 style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "var(--accent-primary)" }}>
                                                        Editorial Instructions & Revision Comments:
                                                    </h4>
                                                    <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                                        {decisionRecord.comments}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                    No additional written comments from the editor.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                            No formal editor decision recorded yet.
                                        </p>
                                    )}

                                    {/* Blinded Peer Reviews */}
                                    <div>
                                        <h4 style={{ fontSize: "1.05rem", color: "var(--text-primary)", margin: "0 0 14px 0" }}>
                                            Blinded Peer Review Evaluations ({manuscriptReviews.length})
                                        </h4>

                                        {manuscriptReviews.length === 0 ? (
                                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                                No completed reviewer reports available.
                                            </p>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                                {manuscriptReviews.map((rev, idx) => (
                                                    <div
                                                        key={rev.id || idx}
                                                        style={{
                                                            padding: "16px",
                                                            borderRadius: "8px",
                                                            background: "rgba(255, 255, 255, 0.02)",
                                                            border: "1px solid rgba(255, 255, 255, 0.06)"
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                            <strong>Anonymous Reviewer #{idx + 1}</strong>
                                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                                <span className="badge badge-submitted">
                                                                    {rev.recommendation}
                                                                </span>
                                                                <span style={{ fontSize: "0.85rem", color: "#a5b4fc", fontWeight: 700 }}>
                                                                    ★ {rev.rating}/5
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Criteria ratings */}
                                                        <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                                                            {rev.clarityRating && <span>Clarity: {rev.clarityRating}/5</span>}
                                                            {rev.originalityRating && <span>Originality: {rev.originalityRating}/5</span>}
                                                            {rev.methodologyRating && <span>Methodology: {rev.methodologyRating}/5</span>}
                                                        </div>

                                                        {/* Blinded comments */}
                                                        {rev.commentsToAuthor && (
                                                            <div style={{ marginTop: "8px" }}>
                                                                <strong style={{ fontSize: "0.85rem", color: "var(--accent-primary)" }}>
                                                                    Comments to Author:
                                                                </strong>
                                                                <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                                                    {rev.commentsToAuthor}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {rev.comments && (
                                                            <div style={{ marginTop: "8px" }}>
                                                                <strong style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                                                                    General Evaluation:
                                                                </strong>
                                                                <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                                                    {rev.comments}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                                <button
                                    type="button"
                                    onClick={() => setFeedbackModalManuscript(null)}
                                    className="btn btn-secondary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );

}


export default AuthorDashboard;