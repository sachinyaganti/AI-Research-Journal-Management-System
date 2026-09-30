package com.researchjournal.service;

import com.researchjournal.client.PdfExtractionClient;
import com.researchjournal.client.SimilarityAnalysisClient;
import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.SimilarityAnalysis;
import com.researchjournal.repository.ManuscriptRepository;
import com.researchjournal.repository.SimilarityAnalysisRepository;
import org.springframework.stereotype.Service;
import com.researchjournal.dto.SimilarityAnalysisResponse;
import com.researchjournal.entity.User;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

@Service
public class SimilarityAnalysisService {

        private final PdfExtractionClient pdfExtractionClient;
        private final ManuscriptRepository manuscriptRepository;
        private final SimilarityAnalysisRepository similarityAnalysisRepository;
        private final SimilarityAnalysisClient similarityAnalysisClient;

        public SimilarityAnalysisService(
                        PdfExtractionClient pdfExtractionClient,
                        ManuscriptRepository manuscriptRepository,
                        SimilarityAnalysisRepository similarityAnalysisRepository,
                        SimilarityAnalysisClient similarityAnalysisClient) {

                this.pdfExtractionClient = pdfExtractionClient;
                this.manuscriptRepository = manuscriptRepository;
                this.similarityAnalysisRepository = similarityAnalysisRepository;
                this.similarityAnalysisClient = similarityAnalysisClient;
        }

        public SimilarityAnalysisClient.SimilarityAnalysisResponse analyzeSimilarity(
                        Long manuscriptId,
                        User currentUser) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Manuscript not found"));

                if (!manuscript.getAuthor().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException(
                                        "You are not authorized to analyze this manuscript");
                }

                return analyzeSimilarityInternal(manuscript);
        }

        private SimilarityAnalysisClient.SimilarityAnalysisResponse analyzeSimilarityInternal(
                        Manuscript manuscript) {

                List<Manuscript> otherManuscripts = manuscriptRepository.findAll()
                                .stream()
                                .filter(other -> !other.getId().equals(manuscript.getId()))
                                .toList();

                List<SimilarityAnalysisClient.SimilarityCandidate> candidates = otherManuscripts.stream()
                                .map(candidate -> new SimilarityAnalysisClient.SimilarityCandidate(
                                                candidate.getId(),
                                                candidate.getTitle(),
                                                candidate.getAbstractText(),
                                                ""))
                                .toList();
                String fullText = "";

                if (manuscript.getFilePath() != null) {

                        try {

                                byte[] pdfBytes = java.nio.file.Files.readAllBytes(
                                                java.nio.file.Paths.get(
                                                                manuscript.getFilePath()));

                                PdfExtractionClient.PdfExtractionResponse pdfResponse = pdfExtractionClient.extractText(
                                                pdfBytes,
                                                manuscript.getFileName());

                                if (pdfResponse != null
                                                && pdfResponse.getExtractedText() != null) {

                                        fullText = pdfResponse.getExtractedText();
                                }

                        } catch (Exception e) {

                                throw new RuntimeException(
                                                "Unable to extract text from manuscript PDF",
                                                e);
                        }
                }
                SimilarityAnalysisClient.SimilarityAnalysisRequest request = new SimilarityAnalysisClient.SimilarityAnalysisRequest(
                                manuscript.getId(),
                                manuscript.getTitle(),
                                manuscript.getAbstractText(),
                                fullText,
                                candidates);

                SimilarityAnalysisClient.SimilarityAnalysisResponse response = similarityAnalysisClient
                                .analyzeSimilarity(request);

                SimilarityAnalysis analysis = new SimilarityAnalysis();

                analysis.setManuscript(manuscript);
                analysis.setSimilarityPercentage(
                                response.getSimilarityPercentage());
                analysis.setStatus(response.getStatus());

                similarityAnalysisRepository.save(analysis);

                return response;
        }

        public SimilarityAnalysisResponse getLatestSimilarity(
                        Long manuscriptId, User currentUser) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Manuscript not found"));

                if (!manuscript.getAuthor().getId().equals(currentUser.getId())) {
                        throw new AccessDeniedException(
                                        "You are not authorized to view this similarity analysis");
                }

                SimilarityAnalysis analysis = similarityAnalysisRepository
                                .findTopByManuscriptOrderByAnalyzedAtDesc(manuscript)
                                .orElse(null);

                if (analysis == null) {
                        return null;
                }

                return new SimilarityAnalysisResponse(
                                analysis.getId(),
                                analysis.getManuscript().getId(),
                                analysis.getSimilarityPercentage(),
                                analysis.getStatus(),
                                analysis.getAnalyzedAt());
        }
}