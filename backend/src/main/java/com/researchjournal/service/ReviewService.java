package com.researchjournal.service;

import com.researchjournal.dto.ReviewRequest;
import com.researchjournal.dto.ReviewResponse;
import com.researchjournal.entity.Review;
import com.researchjournal.entity.ReviewerAssignment;
import com.researchjournal.entity.ReviewerAssignmentStatus;
import com.researchjournal.entity.User;
import com.researchjournal.repository.ReviewRepository;
import com.researchjournal.repository.ReviewerAssignmentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.ManuscriptStatus;
import com.researchjournal.entity.Role;
import com.researchjournal.repository.ManuscriptRepository;

@Service
public class ReviewService {

        private final ReviewRepository reviewRepository;
        private final ReviewerAssignmentRepository assignmentRepository;
        private final ManuscriptRepository manuscriptRepository;

        public ReviewService(
                        ReviewRepository reviewRepository,
                        ReviewerAssignmentRepository assignmentRepository,
                        ManuscriptRepository manuscriptRepository) {

                this.reviewRepository = reviewRepository;
                this.assignmentRepository = assignmentRepository;
                this.manuscriptRepository = manuscriptRepository;
        }

        public ReviewResponse submitReview(
                        Long assignmentId,
                        ReviewRequest request,
                        User reviewer) {

                ReviewerAssignment assignment = assignmentRepository
                                .findById(assignmentId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Reviewer assignment not found"));

                // Make sure the assignment belongs to the logged-in reviewer
                if (!assignment.getReviewer().getId().equals(reviewer.getId())) {
                        throw new AccessDeniedException(
                                        "You are not assigned to this review");
                }

                // A review can only be submitted while reviewing
                if (assignment.getStatus() != ReviewerAssignmentStatus.IN_REVIEW) {

                        throw new IllegalStateException(
                                        "Review can only be submitted when assignment is in review");
                }

                // Prevent duplicate reviews
                if (reviewRepository.existsByAssignment(assignment)) {
                        throw new IllegalStateException(
                                        "A review has already been submitted for this assignment");
                }

                String commentsToAuthor = request.getCommentsToAuthor() != null && !request.getCommentsToAuthor().isBlank()
                                ? request.getCommentsToAuthor()
                                : request.getComments();

                Review review = Review.builder()
                                .assignment(assignment)
                                .rating(request.getRating())
                                .comments(request.getComments())
                                .commentsToAuthor(commentsToAuthor)
                                .confidentialCommentsToEditor(request.getConfidentialCommentsToEditor())
                                .clarityRating(request.getClarityRating())
                                .originalityRating(request.getOriginalityRating())
                                .methodologyRating(request.getMethodologyRating())
                                .recommendation(request.getRecommendation())
                                .build();

                Review savedReview = reviewRepository.save(review);

                // Mark reviewer assignment as completed
                assignment.setStatus(
                                ReviewerAssignmentStatus.COMPLETED);

                assignment.setCompletedAt(
                                java.time.LocalDateTime.now());

                assignmentRepository.save(assignment);

                return toResponse(savedReview, reviewer);
        }

        public List<ReviewResponse> getManuscriptReviews(
                        Long manuscriptId,
                        User currentUser) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Manuscript not found"));

                boolean isEditorOrAdmin = currentUser.getRole() == Role.EDITOR
                                || currentUser.getRole() == Role.ADMIN;
                boolean isAuthor = manuscript.getAuthor().getId().equals(currentUser.getId());

                if (!isEditorOrAdmin && !isAuthor) {
                        throw new AccessDeniedException(
                                        "Only editors, admins, or the manuscript author can view manuscript reviews");
                }

                // If author, only allow viewing when a decision has been made or revisions requested
                if (isAuthor && (manuscript.getStatus() == ManuscriptStatus.DRAFT || manuscript.getStatus() == ManuscriptStatus.SUBMITTED || manuscript.getStatus() == ManuscriptStatus.UNDER_REVIEW)) {
                        throw new AccessDeniedException(
                                        "Reviews are not visible to authors while under active review");
                }

                return reviewRepository
                                .findByAssignment_Manuscript(manuscript)
                                .stream()
                                .map(r -> toResponse(r, currentUser))
                                .toList();
        }

        public ReviewResponse getReview(
                        Long reviewId,
                        User currentUser) {

                Review review = reviewRepository
                                .findById(reviewId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Review not found"));

                ReviewerAssignment assignment = review.getAssignment();

                boolean isOwner = assignment.getReviewer()
                                .getId()
                                .equals(currentUser.getId());

                boolean isEditorOrAdmin = currentUser.getRole().name().equals("EDITOR")
                                || currentUser.getRole().name().equals("ADMIN");

                if (!isOwner && !isEditorOrAdmin) {
                        throw new AccessDeniedException(
                                        "You are not authorized to view this review");
                }

                return toResponse(review, currentUser);
        }

        private ReviewResponse toResponse(Review review, User currentUser) {

                ReviewerAssignment assignment = review.getAssignment();

                var manuscript = assignment.getManuscript();
                var reviewer = assignment.getReviewer();

                boolean isEditorOrAdmin = currentUser != null && (
                                currentUser.getRole() == Role.EDITOR || currentUser.getRole() == Role.ADMIN);
                boolean isReviewingReviewer = currentUser != null && reviewer.getId().equals(currentUser.getId());

                // Confidential comments to editor are ONLY visible to Editors, Admins, or the author of the review
                String confidentialComments = (isEditorOrAdmin || isReviewingReviewer)
                                ? review.getConfidentialCommentsToEditor()
                                : null;

                // Anonymize reviewer name if author is viewing
                boolean isAuthor = currentUser != null && manuscript.getAuthor().getId().equals(currentUser.getId()) && !isEditorOrAdmin;
                String reviewerName = isAuthor ? "Anonymous Reviewer" : reviewer.getFullName();
                Long reviewerId = isAuthor ? null : reviewer.getId();

                return ReviewResponse.builder()
                                .id(review.getId())
                                .assignmentId(assignment.getId())
                                .manuscriptId(manuscript.getId())
                                .manuscriptTitle(manuscript.getTitle())
                                .reviewerId(reviewerId)
                                .reviewerName(reviewerName)
                                .rating(review.getRating())
                                .comments(review.getComments())
                                .commentsToAuthor(review.getCommentsToAuthor() != null ? review.getCommentsToAuthor() : review.getComments())
                                .confidentialCommentsToEditor(confidentialComments)
                                .clarityRating(review.getClarityRating())
                                .originalityRating(review.getOriginalityRating())
                                .methodologyRating(review.getMethodologyRating())
                                .recommendation(review.getRecommendation())
                                .createdAt(review.getCreatedAt())
                                .updatedAt(review.getUpdatedAt())
                                .build();
        }
}