import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function WriteReviewPage() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [assignment, setAssignment] = useState(null);

    const [rating, setRating] = useState(5);
    const [comments, setComments] = useState("");
    const [recommendation, setRecommendation] =
        useState("MINOR_REVISION");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/reviewer-assignments/${assignmentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to load assignment"
                    );
                }

                setAssignment(data);
            } catch (err) {
                setError(
                    err.message ||
                    "Failed to load assignment"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchAssignment();
        }
    }, [assignmentId, token]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/reviewer-assignments/${assignmentId}/review`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        rating: Number(rating),
                        comments,
                        recommendation,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to submit review"
                );
            }

            navigate("/reviewer");
        } catch (err) {
            setError(
                err.message ||
                "Failed to submit review"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "32px" }}>
                <p>Loading assignment...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "32px",
                textAlign: "left",
                maxWidth: "900px",
                margin: "0 auto",
            }}
        >
            <h1>Write Review</h1>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            {assignment && (
                <>
                    <section
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "20px",
                            marginBottom: "24px",
                        }}
                    >
                        <h2>
                            {assignment.manuscriptTitle}
                        </h2>

                        <p>
                            <strong>
                                Manuscript ID:
                            </strong>{" "}
                            {assignment.manuscriptId}
                        </p>

                        <p>
                            <strong>
                                Assignment ID:
                            </strong>{" "}
                            {assignment.id}
                        </p>

                        <p>
                            <strong>
                                Status:
                            </strong>{" "}
                            {assignment.status}
                        </p>

                        <p>
                            <strong>
                                Due Date:
                            </strong>{" "}
                            {assignment.dueDate ||
                                "Not specified"}
                        </p>
                    </section>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="rating">
                                Rating
                            </label>
                            <br />

                            <select
                                id="rating"
                                value={rating}
                                onChange={(event) =>
                                    setRating(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="1">
                                    1 - Poor
                                </option>
                                <option value="2">
                                    2 - Below Average
                                </option>
                                <option value="3">
                                    3 - Average
                                </option>
                                <option value="4">
                                    4 - Good
                                </option>
                                <option value="5">
                                    5 - Excellent
                                </option>
                            </select>
                        </div>

                        <br />

                        <div>
                            <label htmlFor="comments">
                                Comments
                            </label>
                            <br />

                            <textarea
                                id="comments"
                                value={comments}
                                onChange={(event) =>
                                    setComments(
                                        event.target.value
                                    )
                                }
                                rows={10}
                                required
                                placeholder="Enter your review comments"
                                style={{
                                    width: "100%",
                                }}
                            />
                        </div>

                        <br />

                        <div>
                            <label htmlFor="recommendation">
                                Recommendation
                            </label>
                            <br />

                            <select
                                id="recommendation"
                                value={recommendation}
                                onChange={(event) =>
                                    setRecommendation(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="ACCEPT">
                                    Accept
                                </option>

                                <option value="MINOR_REVISION">
                                    Minor Revision
                                </option>

                                <option value="MAJOR_REVISION">
                                    Major Revision
                                </option>

                                <option value="REJECT">
                                    Reject
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
                                : "Submit Review"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/reviewer")
                            }
                            style={{
                                marginLeft: "10px",
                            }}
                        >
                            Cancel
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default WriteReviewPage;