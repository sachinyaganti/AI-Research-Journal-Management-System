package com.researchjournal.dto;

import com.researchjournal.entity.ManuscriptStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    // PDF metadata
    private String fileName;
    private String fileType;
    private Long fileSize;

    // Publication metadata
    private LocalDateTime publishedAt;
    private String volume;
    private String issue;
    private String doi;
    private String publicationNotes;
}