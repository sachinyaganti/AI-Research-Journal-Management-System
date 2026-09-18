import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import EditorDashboard from "../pages/EditorDashboard";
import ProtectedRoute from "./ProtectedRoute";
import AuthorDashboard from "../pages/AuthorDashboard";
import CreateManuscriptPage from "../pages/CreateManuscriptPage";
import EditManuscriptPage from "../pages/EditManuscriptPage";
import ReviewerDashboard from "../pages/ReviewerDashboard";
import WriteReviewPage from "../pages/WriteReviewPage";
import ManuscriptReviewsPage from "../pages/ManuscriptReviewsPage";
import EditorDecisionPage from "../pages/EditorDecisionPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/author"
                element={
                    <ProtectedRoute allowedRoles={["AUTHOR"]}>
                        <AuthorDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/author/manuscripts/new"
                element={
                    <ProtectedRoute allowedRoles={["AUTHOR"]}>
                        <CreateManuscriptPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/author/manuscripts/:id/edit"
                element={
                    <ProtectedRoute allowedRoles={["AUTHOR"]}>
                        <EditManuscriptPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reviewer"
                element={
                    <ProtectedRoute allowedRoles={["REVIEWER"]}>
                        <ReviewerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reviewer/assignments/:assignmentId/review"
                element={
                    <ProtectedRoute allowedRoles={["REVIEWER"]}>
                        <WriteReviewPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/editor/manuscripts/:manuscriptId/reviews"
                element={
                    <ProtectedRoute allowedRoles={["EDITOR"]}>
                        <ManuscriptReviewsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/editor"
                element={
                    <ProtectedRoute allowedRoles={["EDITOR"]}>
                        <EditorDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/editor/manuscripts/:manuscriptId/decision"
                element={
                    <ProtectedRoute allowedRoles={["EDITOR"]}>
                        <EditorDecisionPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRoutes;