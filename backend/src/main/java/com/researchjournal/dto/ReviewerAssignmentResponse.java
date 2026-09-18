package com.researchjournal.dto;

import com.researchjournal.entity.ReviewerAssignmentStatus;

import java.time.LocalDateTime;

public class ReviewerAssignmentResponse {

    private Long id;

    private Long manuscriptId;
    private String manuscriptTitle;

    private Long reviewerId;
    private String reviewerName;
    private String reviewerEmail;

    private ReviewerAssignmentStatus status;

    private LocalDateTime assignedAt;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;

    public ReviewerAssignmentResponse(
            Long id,
            Long manuscriptId,
            String manuscriptTitle,
            Long reviewerId,
            String reviewerName,
            String reviewerEmail,
            ReviewerAssignmentStatus status,
            LocalDateTime assignedAt,
            LocalDateTime dueDate,
            LocalDateTime completedAt) {
        this.id = id;
        this.manuscriptId = manuscriptId;
        this.manuscriptTitle = manuscriptTitle;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.reviewerEmail = reviewerEmail;
        this.status = status;
        this.assignedAt = assignedAt;
        this.dueDate = dueDate;
        this.completedAt = completedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getManuscriptId() {
        return manuscriptId;
    }

    public String getManuscriptTitle() {
        return manuscriptTitle;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public String getReviewerEmail() {
        return reviewerEmail;
    }

    public ReviewerAssignmentStatus getStatus() {
        return status;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}