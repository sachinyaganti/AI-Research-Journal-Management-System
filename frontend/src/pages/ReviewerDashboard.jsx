import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8080";

function ReviewerDashboard() {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAssignments = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/reviewer-assignments/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load assignments"
                );
            }

            setAssignments(data);
        } catch (err) {
            setError(
                err.message || "Failed to load assignments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAssignments();
        }
    }, [token]);

    const handleStartReview = async (assignmentId) => {
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/reviewer-assignments/${assignmentId}/start`,
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
                    data.message || "Failed to start review"
                );
            }

            await fetchAssignments();
        } catch (err) {
            setError(
                err.message || "Failed to start review"
            );
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
                        Reviewer Dashboard
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
                <h2>My Assignments</h2>

                {loading && (
                    <p>Loading assignments...</p>
                )}

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}

                {!loading &&
                    !error &&
                    assignments.length === 0 && (
                        <p>
                            You don't have any reviewer assignments.
                        </p>
                    )}

                {!loading &&
                    assignments.length > 0 && (
                        <div
                            style={{
                                display: "grid",
                                gap: "16px",
                                marginTop: "20px",
                            }}
                        >
                            {assignments.map((assignment) => (
                                <article
                                    key={assignment.id}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "20px",
                                    }}
                                >
                                    <h2>
                                        {assignment.manuscriptTitle}
                                    </h2>

                                    <p>
                                        <strong>Assignment ID:</strong>{" "}
                                        {assignment.id}
                                    </p>

                                    <p>
                                        <strong>Manuscript ID:</strong>{" "}
                                        {assignment.manuscriptId}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {assignment.status}
                                    </p>

                                    <p>
                                        <strong>Assigned At:</strong>{" "}
                                        {assignment.assignedAt}
                                    </p>

                                    <p>
                                        <strong>Due Date:</strong>{" "}
                                        {assignment.dueDate || "Not specified"}
                                    </p>

                                    {assignment.status === "ASSIGNED" && (
                                        <button
                                            onClick={() =>
                                                handleStartReview(
                                                    assignment.id
                                                )
                                            }
                                        >
                                            Start Review
                                        </button>
                                    )}

                                    {assignment.status === "IN_REVIEW" && (
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/reviewer/assignments/${assignment.id}/review`
                                                )
                                            }
                                        >
                                            Write Review
                                        </button>
                                    )}

                                    {assignment.status === "COMPLETED" && (
                                        <p>
                                            <strong>
                                                Review completed
                                            </strong>
                                        </p>
                                    )}

                                    {assignment.status === "DECLINED" && (
                                        <p>
                                            <strong>
                                                Assignment declined
                                            </strong>
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
            </section>
        </div>
    );
}

export default ReviewerDashboard;