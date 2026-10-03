package com.researchjournal.service;

import com.researchjournal.client.AIAnalysisClient;
import com.researchjournal.client.SimilarityAnalysisClient;
import com.researchjournal.dto.PrePublicationScreeningResponse;
import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.User;
import com.researchjournal.repository.ManuscriptRepository;
import com.researchjournal.service.AIContentAnalysisService.AIContentAnalysisResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class PrePublicationScreeningService {

    private final ManuscriptRepository manuscriptRepository;
    private final SimilarityAnalysisService similarityAnalysisService;
    private final AIContentAnalysisService aiContentAnalysisService;
    private final ManuscriptService manuscriptService;

    public PrePublicationScreeningService(
            ManuscriptRepository manuscriptRepository,
            SimilarityAnalysisService similarityAnalysisService,
            AIContentAnalysisService aiContentAnalysisService,
            ManuscriptService manuscriptService) {

        this.manuscriptRepository = manuscriptRepository;
        this.similarityAnalysisService = similarityAnalysisService;
        this.aiContentAnalysisService = aiContentAnalysisService;
        this.manuscriptService = manuscriptService;
    }

    public PrePublicationScreeningResponse runScreening(
            Long manuscriptId,
            User currentUser) {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Manuscript not found"));

        validateAccess(manuscript, currentUser);

        if (manuscript.getFilePath() == null ||
                manuscript.getFilePath().isBlank()) {

            throw new IllegalArgumentException(
                    "A research paper PDF must be uploaded before screening");
        }

        /*
         * 1. Similarity screening
         */
        SimilarityAnalysisClient.SimilarityAnalysisResponse similarity =
                similarityAnalysisService.analyzeSimilarity(
                        manuscriptId,
                        currentUser);

        /*
         * 2. AI-generated-content assessment
         */
        AIContentAnalysisResponse aiContent =
                aiContentAnalysisService.analyzeManuscript(
                        manuscriptId,
                        currentUser);

        /*
         * 3. Manuscript quality analysis
         */
        AIAnalysisClient.ManuscriptAnalysisResponse qualityAnalysis =
                manuscriptService.analyzeManuscript(
                        manuscriptId,
                        currentUser);

        /*
         * All three screening components completed.
         */

        manuscript.setScreeningCompleted(true);
        manuscriptRepository.save(manuscript);

        return new PrePublicationScreeningResponse(
                manuscript.getId(),
                manuscript.getTitle(),
                "COMPLETED",
                similarity,
                aiContent,
                qualityAnalysis,
                "Pre-publication screening completed successfully"
        );
    }

    private void validateAccess(
            Manuscript manuscript,
            User currentUser) {

        boolean isOwner =
                manuscript.getAuthor()
                        .getId()
                        .equals(currentUser.getId());

        boolean isEditor =
                currentUser.getRole().name().equals("EDITOR");

        boolean isAdmin =
                currentUser.getRole().name().equals("ADMIN");

        if (!isOwner && !isEditor && !isAdmin) {
            throw new AccessDeniedException(
                    "You are not authorized to run screening for this manuscript");
        }
    }
}