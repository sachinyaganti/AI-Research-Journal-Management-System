import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://research-journal-backend-docker.onrender.com";

function CreateManuscriptPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        abstractText: "",
        keywords: "",
        category: "",
    });

    const [manuscriptId, setManuscriptId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [step, setStep] = useState(1);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [screening, setScreening] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [screeningResult, setScreeningResult] = useState(null);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    // STEP 1: Create manuscript draft
    const handleCreateDraft = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

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

            setManuscriptId(data.id);

            setSuccess(
                "Draft created successfully. Upload your research paper PDF."
            );

            setStep(2);
        } catch (err) {
            setError(
                err.message || "Failed to create manuscript"
            );
        } finally {
            setLoading(false);
        }
    };

    // Select PDF
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        setError("");
        setSuccess("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (file.type !== "application/pdf") {
            setError("Only PDF files are allowed.");
            setSelectedFile(null);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("PDF file must be smaller than 10 MB.");
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    // STEP 2: Upload PDF
    const handleUploadPdf = async () => {
        if (!manuscriptId) {
            setError("Manuscript ID is missing.");
            return;
        }

        if (!selectedFile) {
            setError("Please select a PDF file.");
            return;
        }

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const uploadData = new FormData();
            uploadData.append("file", selectedFile);

            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/file`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: uploadData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to upload PDF"
                );
            }

            setSuccess(
                "Research paper PDF uploaded successfully."
            );

            setStep(3);
        } catch (err) {
            setError(
                err.message || "Failed to upload PDF"
            );
        } finally {
            setUploading(false);
        }
    };

    // STEP 3: Run complete screening
    const handleScreening = async () => {
        if (!manuscriptId) {
            setError("Manuscript ID is missing.");
            return;
        }

        setScreening(true);
        setError("");
        setSuccess("");
        setScreeningResult(null);

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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Pre-publication screening failed"
                );
            }

            setScreeningResult(data);

            setSuccess(
                "Pre-publication screening completed successfully."
            );

            setStep(4);
        } catch (err) {
            setError(
                err.message ||
                "Pre-publication screening failed"
            );
        } finally {
            setScreening(false);
        }
    };

    // STEP 4: Submit manuscript
    const handleSubmitManuscript = async () => {
        if (!manuscriptId) {
            setError("Manuscript ID is missing.");
            return;
        }

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/submit`,
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

            setSuccess(
                "Manuscript submitted successfully."
            );

            setTimeout(() => {
                navigate("/author");
            }, 1200);
        } catch (err) {
            setError(
                err.message || "Failed to submit manuscript"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const renderProgress = () => {
        return (
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "30px",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background:
                            step >= 1 ? "#2563eb" : "#e5e7eb",
                        color:
                            step >= 1 ? "white" : "#374151",
                    }}
                >
                    1. Paper Details
                </div>

                <div
                    style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background:
                            step >= 2 ? "#2563eb" : "#e5e7eb",
                        color:
                            step >= 2 ? "white" : "#374151",
                    }}
                >
                    2. Upload PDF
                </div>

                <div
                    style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background:
                            step >= 3 ? "#2563eb" : "#e5e7eb",
                        color:
                            step >= 3 ? "white" : "#374151",
                    }}
                >
                    3. AI Screening
                </div>

                <div
                    style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        background:
                            step >= 4 ? "#2563eb" : "#e5e7eb",
                        color:
                            step >= 4 ? "white" : "#374151",
                    }}
                >
                    4. Submit
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "32px",
                textAlign: "left",
            }}
        >
            <h1>New Research Paper</h1>

            <p>
                Create your research manuscript, upload the paper PDF,
                run pre-publication screening, and submit it for review.
            </p>

            {renderProgress()}

            {error && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        background: "#fee2e2",
                        color: "#991b1b",
                    }}
                    role="alert"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        background: "#dcfce7",
                        color: "#166534",
                    }}
                >
                    {success}
                </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
                <form onSubmit={handleCreateDraft}>
                    <h2>Research Paper Details</h2>

                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="title">
                            <strong>Title</strong>
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
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "6px",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="abstractText">
                            <strong>Abstract</strong>
                        </label>

                        <br />

                        <textarea
                            id="abstractText"
                            name="abstractText"
                            value={formData.abstractText}
                            onChange={handleChange}
                            rows={8}
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "6px",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="keywords">
                            <strong>Keywords</strong>
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
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "6px",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="category">
                            <strong>Category</strong>
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
                            placeholder="Artificial Intelligence"
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "6px",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Draft..."
                            : "Create Draft & Continue"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/author")}
                        style={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <div>
                    <h2>Upload Research Paper PDF</h2>

                    <p>
                        Upload the complete research paper as a PDF.
                        The PDF will be used for similarity screening,
                        AI-content assessment, and manuscript quality analysis.
                    </p>

                    <div
                        style={{
                            padding: "20px",
                            border: "1px solid #d1d5db",
                            borderRadius: "10px",
                            marginBottom: "20px",
                        }}
                    >
                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                        />

                        {selectedFile && (
                            <div style={{ marginTop: "15px" }}>
                                <strong>Selected file:</strong>{" "}
                                {selectedFile.name}

                                <br />

                                <strong>Size:</strong>{" "}
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}
                                {" MB"}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleUploadPdf}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading
                            ? "Uploading..."
                            : "Upload PDF & Continue"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/author")}
                        style={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <div>
                    <h2>Pre-Publication Screening</h2>

                    <p>
                        Your uploaded research paper will now be analyzed
                        using the existing AI screening pipeline.
                    </p>

                    <div
                        style={{
                            padding: "20px",
                            border: "1px solid #d1d5db",
                            borderRadius: "10px",
                            marginBottom: "20px",
                        }}
                    >
                        <h3>Screening includes</h3>

                        <ul>
                            <li>
                                Similarity / plagiarism screening
                            </li>
                            <li>
                                AI-generated-content assessment
                            </li>
                            <li>
                                Manuscript quality analysis
                            </li>
                            <li>
                                Missing sections and writing issues
                            </li>
                            <li>
                                Improvement suggestions
                            </li>
                        </ul>
                    </div>

                    <button
                        type="button"
                        onClick={handleScreening}
                        disabled={screening}
                    >
                        {screening
                            ? "Running AI Screening..."
                            : "Run Pre-Publication Screening"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/author")}
                        style={{ marginLeft: "10px" }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* STEP 4 */}
            {step === 4 && screeningResult && (
                <div>
                    <h2>Pre-Publication Screening Report</h2>

                    <p>
                        Review the screening results before submitting
                        your manuscript.
                    </p>

                    {/* Similarity */}
                    {screeningResult.similarity && (
                        <div
                            style={{
                                padding: "20px",
                                border: "1px solid #d1d5db",
                                borderRadius: "10px",
                                marginBottom: "20px",
                            }}
                        >
                            <h3>Similarity Screening</h3>

                            <p>
                                <strong>Similarity:</strong>{" "}
                                {
                                    screeningResult.similarity
                                        .similarity_percentage
                                }
                                %
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {
                                    screeningResult.similarity.status
                                }
                            </p>

                            {screeningResult.similarity.matches?.length >
                                0 && (
                                    <div>
                                        <h4>Matching Manuscripts</h4>

                                        <ul>
                                            {screeningResult.similarity.matches.map(
                                                (match) => (
                                                    <li
                                                        key={
                                                            match.manuscript_id
                                                        }
                                                    >
                                                        {match.title} —{" "}
                                                        {
                                                            match.similarity_percentage
                                                        }
                                                        %
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    )}

                    {/* AI Content */}
                    {screeningResult.aiContent && (
                        <div
                            style={{
                                padding: "20px",
                                border: "1px solid #d1d5db",
                                borderRadius: "10px",
                                marginBottom: "20px",
                            }}
                        >
                            <h3>
                                AI-Generated Content Assessment
                            </h3>

                            <p>
                                <strong>
                                    AI-content indicator:
                                </strong>{" "}
                                {
                                    screeningResult.aiContent
                                        .aiContentIndicator
                                }
                                %
                            </p>

                            <p>
                                <strong>
                                    Human-writing indicator:
                                </strong>{" "}
                                {
                                    screeningResult.aiContent
                                        .humanWritingIndicator
                                }
                                %
                            </p>

                            <p>
                                <strong>Confidence:</strong>{" "}
                                {
                                    screeningResult.aiContent
                                        .confidence
                                }
                            </p>

                            {screeningResult.aiContent.signals && (
                                <div>
                                    <h4>Detected Signals</h4>

                                    <pre
                                        style={{
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {
                                            screeningResult.aiContent
                                                .signals
                                        }
                                    </pre>
                                </div>
                            )}

                            <p>
                                <strong>Explanation:</strong>{" "}
                                {
                                    screeningResult.aiContent
                                        .explanation
                                }
                            </p>
                        </div>
                    )}

                    {/* Quality */}
                    {screeningResult.qualityAnalysis && (
                        <div
                            style={{
                                padding: "20px",
                                border: "1px solid #d1d5db",
                                borderRadius: "10px",
                                marginBottom: "20px",
                            }}
                        >
                            <h3>Manuscript Quality Analysis</h3>

                            <p>
                                <strong>Abstract:</strong>{" "}
                                {
                                    screeningResult.qualityAnalysis
                                        .abstract_quality
                                }
                            </p>

                            <p>
                                <strong>Methodology:</strong>{" "}
                                {
                                    screeningResult.qualityAnalysis
                                        .methodology_quality
                                }
                            </p>

                            <p>
                                <strong>Results:</strong>{" "}
                                {
                                    screeningResult.qualityAnalysis
                                        .results_quality
                                }
                            </p>

                            <p>
                                <strong>Conclusion:</strong>{" "}
                                {
                                    screeningResult.qualityAnalysis
                                        .conclusion_quality
                                }
                            </p>

                            <p>
                                <strong>Writing:</strong>{" "}
                                {
                                    screeningResult.qualityAnalysis
                                        .writing_quality
                                }
                            </p>

                            <p>
                                <strong>Relevance:</strong>{" "}
                                {
                                    screeningResult.qualityAnalysis
                                        .relevance
                                }
                            </p>

                            {screeningResult.qualityAnalysis
                                .missing_sections?.length > 0 && (
                                    <div>
                                        <h4>Missing Sections</h4>

                                        <ul>
                                            {screeningResult.qualityAnalysis
                                                .missing_sections.map(
                                                    (section) => (
                                                        <li key={section}>
                                                            {section}
                                                        </li>
                                                    )
                                                )}
                                        </ul>
                                    </div>
                                )}

                            {screeningResult.qualityAnalysis
                                .suggestions?.length > 0 && (
                                    <div>
                                        <h4>Suggestions</h4>

                                        <ul>
                                            {screeningResult.qualityAnalysis
                                                .suggestions.map(
                                                    (suggestion, index) => (
                                                        <li key={index}>
                                                            {suggestion}
                                                        </li>
                                                    )
                                                )}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    )}

                    <div
                        style={{
                            padding: "16px",
                            background: "#f3f4f6",
                            borderRadius: "8px",
                            marginBottom: "20px",
                        }}
                    >
                        <strong>
                            Screening completed successfully.
                        </strong>

                        <p>
                            The report is informational and should be
                            reviewed before manuscript submission.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmitManuscript}
                        disabled={submitting}
                    >
                        {submitting
                            ? "Submitting..."
                            : "Submit Manuscript"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/author")}
                        style={{ marginLeft: "10px" }}
                    >
                        Save & Exit
                    </button>
                </div>
            )}
        </div>
    );
}

export default CreateManuscriptPage;