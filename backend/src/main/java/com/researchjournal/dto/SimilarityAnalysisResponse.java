package com.researchjournal.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SimilarityAnalysisResponse {

    private Long id;

    private Long manuscriptId;

    private double similarityPercentage;

    private String status;

    private LocalDateTime analyzedAt;

    public SimilarityAnalysisResponse() {
    }

    public SimilarityAnalysisResponse(
            Long id,
            Long manuscriptId,
            double similarityPercentage,
            String status,
            LocalDateTime analyzedAt) {

        this.id = id;
        this.manuscriptId = manuscriptId;
        this.similarityPercentage = similarityPercentage;
        this.status = status;
        this.analyzedAt = analyzedAt;
    }
}