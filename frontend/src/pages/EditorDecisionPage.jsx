import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function EditorDecisionPage() {
    const { manuscriptId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [decision, setDecision] = useState("ACCEPTED");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${manuscriptId}/decision`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        decision,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to submit editor decision"
                );
            }

            setSuccess(
                `Decision submitted successfully: ${data.decision}`
            );

            setTimeout(() => {
                navigate("/editor");
            }, 1000);
        } catch (err) {
            setError(
                err.message ||
                "Failed to submit editor decision"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                padding: "32px",
                textAlign: "left",
                maxWidth: "700px",
                margin: "0 auto",
            }}
        >
            <button
                type="button"
                onClick={() => navigate("/editor")}
            >
                Back to Editor Dashboard
            </button>

            <h1>Editor Decision</h1>

            <p>
                <strong>Manuscript ID:</strong>{" "}
                {manuscriptId}
            </p>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            {success && (
                <p>
                    {success}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="decision">
                        Decision
                    </label>
                    <br />

                    <select
                        id="decision"
                        value={decision}
                        onChange={(event) =>
                            setDecision(
                                event.target.value
                            )
                        }
                    >
                        <option value="ACCEPTED">
                            Accepted
                        </option>

                        <option value="REVISION_REQUIRED">
                            Revision Required
                        </option>

                        <option value="REJECTED">
                            Rejected
                        </option>
                    </select>
                </div>

                <br />

                <button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting
                        ? "Submitting..."
                        : "Submit Decision"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/editor")}
                    style={{
                        marginLeft: "10px",
                    }}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default EditorDecisionPage;