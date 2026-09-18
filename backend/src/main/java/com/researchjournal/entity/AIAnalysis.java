package com.researchjournal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manuscript_id", nullable = false)
    private Manuscript manuscript;

    @Column(nullable = false)
    private String abstractQuality;

    @Column(nullable = false)
    private String methodologyQuality;

    @Column(nullable = false)
    private String resultsQuality;

    @Column(nullable = false)
    private String conclusionQuality;

    @Column(nullable = false)
    private String writingQuality;

    @Column(nullable = false)
    private String relevance;

    @Column(nullable = false)
    private Integer abstractWordCount;

    @Column(nullable = false)
    private Integer keywordCount;

    @Column(columnDefinition = "TEXT")
    private String missingSections;

    @Column(columnDefinition = "TEXT")
    private String writingIssues;

    @Column(columnDefinition = "TEXT")
    private String suggestions;

    @Column(nullable = false, updatable = false)
    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }
}