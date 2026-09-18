package com.researchjournal.controller;

import com.researchjournal.dto.ReviewRequest;
import com.researchjournal.dto.ReviewResponse;
import com.researchjournal.entity.User;
import com.researchjournal.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviewer-assignments/{assignmentId}/review")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse submitReview(
            @PathVariable Long assignmentId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        if (!currentUser.getRole().name().equals("REVIEWER")) {
            throw new AccessDeniedException(
                    "Only reviewers can submit reviews");
        }

        return reviewService.submitReview(
                assignmentId,
                request,
                currentUser);
    }

    @GetMapping("/manuscripts/{manuscriptId}/reviews")
    public List<ReviewResponse> getManuscriptReviews(
            @PathVariable Long manuscriptId,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        return reviewService.getManuscriptReviews(
                manuscriptId,
                currentUser);
    }

    @GetMapping("/reviews/{reviewId}")
    public ReviewResponse getReview(
            @PathVariable Long reviewId,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        return reviewService.getReview(
                reviewId,
                currentUser);
    }
}