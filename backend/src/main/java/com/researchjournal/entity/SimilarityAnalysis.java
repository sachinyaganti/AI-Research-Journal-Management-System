package com.researchjournal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "similarity_analyses")
@Getter
@Setter
public class SimilarityAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manuscript_id", nullable = false)
    private Manuscript manuscript;

    @Column(name = "similarity_percentage", nullable = false)
    private double similarityPercentage;

    @Column(nullable = false)
    private String status;

    @Column(name = "analyzed_at", nullable = false)
    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onCreate() {
        analyzedAt = LocalDateTime.now();
    }
}