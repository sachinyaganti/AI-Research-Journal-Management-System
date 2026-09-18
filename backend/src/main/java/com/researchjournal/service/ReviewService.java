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

                Review review = Review.builder()
                                .assignment(assignment)
                                .rating(request.getRating())
                                .comments(request.getComments())
                                .recommendation(request.getRecommendation())
                                .build();

                Review savedReview = reviewRepository.save(review);

                // Mark reviewer assignment as completed
                assignment.setStatus(
                                ReviewerAssignmentStatus.COMPLETED);

                assignment.setCompletedAt(
                                java.time.LocalDateTime.now());

                assignmentRepository.save(assignment);

                return toResponse(savedReview);
        }

        public List<ReviewResponse> getManuscriptReviews(
                        Long manuscriptId,
                        User currentUser) {

                if (currentUser.getRole() != Role.EDITOR
                                && currentUser.getRole() != Role.ADMIN) {

                        throw new AccessDeniedException(
                                        "Only editors and admins can view manuscript reviews");
                }

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Manuscript not found"));

                return reviewRepository
                                .findByAssignment_Manuscript(manuscript)
                                .stream()
                                .map(this::toResponse)
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

                // Reviewer can access only their own review.
                // Editors and admins can access any review.
                boolean isOwner = assignment.getReviewer()
                                .getId()
                                .equals(currentUser.getId());

                boolean isEditorOrAdmin = currentUser.getRole().name().equals("EDITOR")
                                || currentUser.getRole().name().equals("ADMIN");

                if (!isOwner && !isEditorOrAdmin) {
                        throw new AccessDeniedException(
                                        "You are not authorized to view this review");
                }

                return toResponse(review);
        }

        private ReviewResponse toResponse(Review review) {

                ReviewerAssignment assignment = review.getAssignment();

                var manuscript = assignment.getManuscript();
                var reviewer = assignment.getReviewer();

                return new ReviewResponse(
                                review.getId(),
                                assignment.getId(),
                                manuscript.getId(),
                                manuscript.getTitle(),
                                reviewer.getId(),
                                reviewer.getFullName(),
                                review.getRating(),
                                review.getComments(),
                                review.getRecommendation(),
                                review.getCreatedAt(),
                                review.getUpdatedAt());
        }
}