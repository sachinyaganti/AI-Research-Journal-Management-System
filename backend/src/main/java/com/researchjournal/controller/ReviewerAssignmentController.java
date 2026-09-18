package com.researchjournal.controller;

import com.researchjournal.dto.ReviewerAssignmentRequest;
import com.researchjournal.dto.ReviewerAssignmentResponse;
import com.researchjournal.entity.User;
import com.researchjournal.service.ReviewerAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewerAssignmentController {

        private final ReviewerAssignmentService assignmentService;

        public ReviewerAssignmentController(
                        ReviewerAssignmentService assignmentService) {

                this.assignmentService = assignmentService;
        }

        @PostMapping("/manuscripts/{manuscriptId}/reviewers")
        @ResponseStatus(HttpStatus.CREATED)
        public ReviewerAssignmentResponse assignReviewer(
                        @PathVariable Long manuscriptId,
                        @Valid @RequestBody ReviewerAssignmentRequest request,
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();

                if (currentUser.getRole().name().equals("AUTHOR")
                                || currentUser.getRole().name().equals("REVIEWER")) {

                        throw new AccessDeniedException(
                                        "Only editors and admins can assign reviewers");
                }

                return assignmentService.assignReviewer(
                                manuscriptId,
                                request);
        }

        @GetMapping("/manuscripts/{manuscriptId}/reviewers")
        public List<ReviewerAssignmentResponse> getManuscriptAssignments(
                        @PathVariable Long manuscriptId,
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();

                if (currentUser.getRole().name().equals("AUTHOR")
                                || currentUser.getRole().name().equals("REVIEWER")) {

                        throw new AccessDeniedException(
                                        "Only editors and admins can view reviewer assignments");
                }

                return assignmentService.getManuscriptAssignments(
                                manuscriptId);
        }

        @GetMapping("/reviewer-assignments/my")
        public List<ReviewerAssignmentResponse> getMyAssignments(
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();

                if (!currentUser.getRole().name().equals("REVIEWER")) {

                        throw new AccessDeniedException(
                                        "Only reviewers can access their assignments");
                }

                return assignmentService.getReviewerAssignments(
                                currentUser);
        }

        @PostMapping("/reviewer-assignments/{assignmentId}/start")
        public ReviewerAssignmentResponse startReview(
                        @PathVariable Long assignmentId,
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();

                if (!currentUser.getRole().name().equals("REVIEWER")) {

                        throw new AccessDeniedException(
                                        "Only reviewers can start a review");
                }

                return assignmentService.startReview(
                                assignmentId,
                                currentUser);
        }

        @GetMapping("/reviewer-assignments/{assignmentId}")
        public ReviewerAssignmentResponse getAssignment(
                        @PathVariable Long assignmentId,
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();

                return assignmentService.getAssignment(
                                assignmentId,
                                currentUser);
        }
}