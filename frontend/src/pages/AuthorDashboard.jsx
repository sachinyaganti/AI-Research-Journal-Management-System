import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./AuthorDashboard.css";

const API_BASE_URL = "http://localhost:8080";

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

                                            </article>
                                        );
                                    }
                                )}

                            </div>
                        )}

                </section>

            </main>
        </div>
    );
}

export default AuthorDashboard;