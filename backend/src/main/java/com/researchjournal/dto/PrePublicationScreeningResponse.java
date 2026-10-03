package com.researchjournal.dto;

import com.researchjournal.client.AIAnalysisClient;
import com.researchjournal.client.SimilarityAnalysisClient;
import com.researchjournal.service.AIContentAnalysisService.AIContentAnalysisResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrePublicationScreeningResponse {

    private Long manuscriptId;
    private String title;

    private String screeningStatus;

    private SimilarityAnalysisClient.SimilarityAnalysisResponse similarity;

    private AIContentAnalysisResponse aiContent;

    private AIAnalysisClient.ManuscriptAnalysisResponse qualityAnalysis;

    private String message;

    public PrePublicationScreeningResponse() {
    }

    public PrePublicationScreeningResponse(
            Long manuscriptId,
            String title,
            String screeningStatus,
            SimilarityAnalysisClient.SimilarityAnalysisResponse similarity,
            AIContentAnalysisResponse aiContent,
            AIAnalysisClient.ManuscriptAnalysisResponse qualityAnalysis,
            String message) {

        this.manuscriptId = manuscriptId;
        this.title = title;
        this.screeningStatus = screeningStatus;
        this.similarity = similarity;
        this.aiContent = aiContent;
        this.qualityAnalysis = qualityAnalysis;
        this.message = message;
    }
}