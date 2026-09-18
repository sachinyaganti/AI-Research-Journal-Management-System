import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

const statuses = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "REVISION_REQUIRED",
    "ACCEPTED",
    "REJECTED",
];

function EditorDashboard() {
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedStatus, setSelectedStatus] = useState("SUBMITTED");
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleMoveToReview = async (id) => {
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/${id}/move-to-review`,
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
                    data.message || "Failed to move manuscript to review"
                );
            }

            await fetchManuscripts(selectedStatus);
        } catch (err) {
            setError(
                err.message ||
                "Failed to move manuscript to review"
            );
        }
    };

    const fetchManuscripts = async (status) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/manuscripts/status/${status}`,
                {
                    method: "GET",
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
            setError(err.message || "Failed to load manuscripts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchManuscripts(selectedStatus);
        }
    }, [token, selectedStatus]);

    const handleLogout = () => {
        logout();
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
                    <h1 style={{ margin: 0 }}>Editor Dashboard</h1>
                    <p>
                        Welcome, {user?.fullName}
                    </p>
                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <section style={{ marginBottom: "32px" }}>
                <h2>Manuscript Status</h2>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            style={{
                                fontWeight:
                                    selectedStatus === status
                                        ? "bold"
                                        : "normal",
                            }}
                        >
                            {status.replaceAll("_", " ")}
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h2>
                    {selectedStatus.replaceAll("_", " ")} Manuscripts
                </h2>

                {loading && <p>Loading manuscripts...</p>}

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}

                {!loading && !error && manuscripts.length === 0 && (
                    <p>
                        No manuscripts found with this status.
                    </p>
                )}

                {!loading && manuscripts.length > 0 && (
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
                                    <strong>Author:</strong>{" "}
                                    {manuscript.authorName}
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {manuscript.authorEmail}
                                </p>

                                <p>
                                    <strong>Category:</strong>{" "}
                                    {manuscript.category}
                                </p>

                                <p>
                                    <strong>Status:</strong>{" "}
                                    {manuscript.status}
                                </p>

                                {manuscript.status === "SUBMITTED" && (
                                    <button
                                        onClick={() =>
                                            handleMoveToReview(manuscript.id)
                                        }
                                    >
                                        Move to Review
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/editor/manuscripts/${manuscript.id}/reviews`
                                        )
                                    }
                                >
                                    View Reviews
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/editor/manuscripts/${manuscript.id}/decision`
                                        )
                                    }
                                >
                                    Make Decision
                                </button>
                                <p>
                                    <strong>Keywords:</strong>{" "}
                                    {manuscript.keywords}
                                </p>

                                <p style={{ marginTop: "12px" }}>
                                    {manuscript.abstractText}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default EditorDashboard;