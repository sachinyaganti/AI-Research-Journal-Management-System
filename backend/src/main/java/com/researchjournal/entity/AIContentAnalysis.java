package com.researchjournal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_content_analysis")
@Getter
@Setter
@NoArgsConstructor
public class AIContentAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manuscript_id", nullable = false)
    private Manuscript manuscript;

    @Column(nullable = false)
    private double aiContentIndicator;

    @Column(nullable = false)
    private double humanWritingIndicator;

    @Column(nullable = false)
    private String confidence;

    @Column(columnDefinition = "TEXT")
    private String signals;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(nullable = false)
    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }
}