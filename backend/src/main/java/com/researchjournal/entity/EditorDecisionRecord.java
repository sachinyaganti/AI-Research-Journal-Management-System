package com.researchjournal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "editor_decisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EditorDecisionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manuscript_id", nullable = false)
    private Manuscript manuscript;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "editor_id", nullable = false)
    private User editor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EditorDecision decision;

    @Column(nullable = false, updatable = false)
    private LocalDateTime decidedAt;

    @PrePersist
    protected void onCreate() {
        decidedAt = LocalDateTime.now();
    }
}