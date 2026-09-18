package com.researchjournal.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ReviewerAssignmentRequest {

    @NotNull(message = "Reviewer ID is required")
    private Long reviewerId;

    @Future(message = "Due date must be in the future")
    private LocalDateTime dueDate;

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
}