package com.researchjournal.dto;

import com.researchjournal.entity.ManuscriptStatus;

import java.time.LocalDateTime;

public class ManuscriptResponse {

    private Long id;
    private String title;
    private String abstractText;
    private String keywords;
    private String category;
    private ManuscriptStatus status;

    private Long authorId;
    private String authorName;
    private String authorEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ManuscriptResponse(
            Long id,
            String title,
            String abstractText,
            String keywords,
            String category,
            ManuscriptStatus status,
            Long authorId,
            String authorName,
            String authorEmail,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.abstractText = abstractText;
        this.keywords = keywords;
        this.category = category;
        this.status = status;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAbstractText() {
        return abstractText;
    }

    public String getKeywords() {
        return keywords;
    }

    public String getCategory() {
        return category;
    }

    public ManuscriptStatus getStatus() {
        return status;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}