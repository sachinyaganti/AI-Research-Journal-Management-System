import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function ManuscriptReviewsPage() {
    const { manuscriptId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/manuscripts/${manuscriptId}/reviews`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load reviews"
                    );
                }

                setReviews(data);
            } catch (err) {
                setError(
                    err.message || "Failed to load reviews"
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchReviews();
        }
    }, [manuscriptId, token]);

    return (
        <div
            style={{
                padding: "32px",
                textAlign: "left",
            }}
        >
            <button onClick={() => navigate("/editor")}>
                Back to Editor Dashboard
            </button>

            <h1>Manuscript Reviews</h1>

            <p>
                <strong>Manuscript ID:</strong>{" "}
                {manuscriptId}
            </p>

            {loading && (
                <p>Loading reviews...</p>
            )}

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            {!loading &&
                !error &&
                reviews.length === 0 && (
                    <p>
                        No reviews have been submitted yet.
                    </p>
                )}

            {!loading &&
                !error &&
                reviews.length > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gap: "16px",
                            marginTop: "20px",
                        }}
                    >
                        {reviews.map((review) => (
                            <article
                                key={review.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "20px",
                                }}
                            >
                                <h2>
                                    Review #{review.id}
                                </h2>

                                <p>
                                    <strong>
                                        Reviewer:
                                    </strong>{" "}
                                    {review.reviewerName}
                                </p>

                                <p>
                                    <strong>
                                        Rating:
                                    </strong>{" "}
                                    {review.rating}/5
                                </p>

                                <p>
                                    <strong>
                                        Recommendation:
                                    </strong>{" "}
                                    {review.recommendation}
                                </p>

                                <p>
                                    <strong>
                                        Comments:
                                    </strong>
                                </p>

                                <p>
                                    {review.comments}
                                </p>

                                <p>
                                    <strong>
                                        Submitted:
                                    </strong>{" "}
                                    {review.createdAt}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
        </div>
    );
}

export default ManuscriptReviewsPage;