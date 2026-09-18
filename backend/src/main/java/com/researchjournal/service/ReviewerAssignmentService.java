package com.researchjournal.service;

import com.researchjournal.dto.ReviewerAssignmentRequest;
import com.researchjournal.dto.ReviewerAssignmentResponse;
import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.ManuscriptStatus;
import com.researchjournal.entity.ReviewerAssignment;
import com.researchjournal.entity.ReviewerAssignmentStatus;
import com.researchjournal.entity.Role;
import com.researchjournal.entity.User;
import com.researchjournal.repository.ManuscriptRepository;
import com.researchjournal.repository.ReviewerAssignmentRepository;
import com.researchjournal.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewerAssignmentService {

        private final ReviewerAssignmentRepository assignmentRepository;
        private final ManuscriptRepository manuscriptRepository;
        private final UserRepository userRepository;

        public ReviewerAssignmentService(
                        ReviewerAssignmentRepository assignmentRepository,
                        ManuscriptRepository manuscriptRepository,
                        UserRepository userRepository) {

                this.assignmentRepository = assignmentRepository;
                this.manuscriptRepository = manuscriptRepository;
                this.userRepository = userRepository;
        }

        public ReviewerAssignmentResponse assignReviewer(
                        Long manuscriptId,
                        ReviewerAssignmentRequest request) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

                if (manuscript.getStatus() != ManuscriptStatus.SUBMITTED
                                && manuscript.getStatus() != ManuscriptStatus.UNDER_REVIEW) {

                        throw new IllegalStateException(
                                        "Only submitted or under-review manuscripts can be assigned to reviewers");
                }

                User reviewer = userRepository
                                .findById(request.getReviewerId())
                                .orElseThrow(() -> new RuntimeException("Reviewer not found"));

                if (reviewer.getRole() != Role.REVIEWER) {
                        throw new IllegalArgumentException(
                                        "Selected user is not a reviewer");
                }

                if (!reviewer.isActive()) {
                        throw new IllegalStateException(
                                        "Reviewer account is inactive");
                }

                /*
                 * Check for an existing active assignment.
                 *
                 * COMPLETED and DECLINED assignments are historical
                 * records and should not prevent a new assignment.
                 */
                List<ReviewerAssignment> existingAssignments = assignmentRepository.findByManuscript(manuscript);

                boolean activeAssignmentExists = existingAssignments
                                .stream()
                                .anyMatch(assignment -> assignment.getReviewer()
                                                .getId()
                                                .equals(reviewer.getId())
                                                && (assignment.getStatus() == ReviewerAssignmentStatus.ASSIGNED
                                                                || assignment.getStatus() == ReviewerAssignmentStatus.IN_REVIEW));

                if (activeAssignmentExists) {
                        throw new IllegalStateException(
                                        "Reviewer is already actively assigned to this manuscript");
                }

                ReviewerAssignment assignment = ReviewerAssignment.builder()
                                .manuscript(manuscript)
                                .reviewer(reviewer)
                                .status(ReviewerAssignmentStatus.ASSIGNED)
                                .dueDate(request.getDueDate())
                                .build();

                ReviewerAssignment saved = assignmentRepository.save(assignment);

                manuscript.setStatus(
                                ManuscriptStatus.UNDER_REVIEW);

                manuscriptRepository.save(manuscript);

                return toResponse(saved);
        }

        public List<ReviewerAssignmentResponse> getManuscriptAssignments(
                        Long manuscriptId) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

                return assignmentRepository
                                .findByManuscript(manuscript)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        public List<ReviewerAssignmentResponse> getReviewerAssignments(
                        User reviewer) {

                return assignmentRepository
                                .findByReviewer(reviewer)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        public ReviewerAssignmentResponse getAssignment(
                        Long assignmentId,
                        User currentUser) {

                ReviewerAssignment assignment = assignmentRepository
                                .findById(assignmentId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Reviewer assignment not found"));

                boolean isOwner = assignment
                                .getReviewer()
                                .getId()
                                .equals(currentUser.getId());

                boolean isEditorOrAdmin = currentUser.getRole() == Role.EDITOR
                                || currentUser.getRole() == Role.ADMIN;

                if (!isOwner && !isEditorOrAdmin) {
                        throw new AccessDeniedException(
                                        "You are not authorized to view this assignment");
                }

                return toResponse(assignment);
        }

        public ReviewerAssignmentResponse startReview(
                        Long assignmentId,
                        User reviewer) {

                ReviewerAssignment assignment = assignmentRepository
                                .findById(assignmentId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Reviewer assignment not found"));

                // Make sure this assignment belongs
                // to the logged-in reviewer.
                if (!assignment.getReviewer()
                                .getId()
                                .equals(reviewer.getId())) {

                        throw new AccessDeniedException(
                                        "You are not assigned to this review");
                }

                // Only ASSIGNED reviews can be started.
                if (assignment.getStatus() != ReviewerAssignmentStatus.ASSIGNED) {

                        throw new IllegalStateException(
                                        "Only assigned reviews can be started");
                }

                assignment.setStatus(
                                ReviewerAssignmentStatus.IN_REVIEW);

                ReviewerAssignment saved = assignmentRepository.save(assignment);

                return toResponse(saved);
        }

        private ReviewerAssignmentResponse toResponse(
                        ReviewerAssignment assignment) {

                Manuscript manuscript = assignment.getManuscript();

                User reviewer = assignment.getReviewer();

                return new ReviewerAssignmentResponse(
                                assignment.getId(),
                                manuscript.getId(),
                                manuscript.getTitle(),
                                reviewer.getId(),
                                reviewer.getFullName(),
                                reviewer.getEmail(),
                                assignment.getStatus(),
                                assignment.getAssignedAt(),
                                assignment.getDueDate(),
                                assignment.getCompletedAt());
        }
}