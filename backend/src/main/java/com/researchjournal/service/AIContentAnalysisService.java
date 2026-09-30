package com.researchjournal.service;

import com.researchjournal.client.AIContentAnalysisClient;
import com.researchjournal.client.PdfExtractionClient;
import com.researchjournal.entity.AIContentAnalysis;
import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.User;
import com.researchjournal.repository.AIContentAnalysisRepository;
import com.researchjournal.repository.ManuscriptRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class AIContentAnalysisService {

    private final ManuscriptRepository manuscriptRepository;
    private final AIContentAnalysisRepository analysisRepository;
    private final PdfExtractionClient pdfExtractionClient;
    private final AIContentAnalysisClient aiContentAnalysisClient;

    public AIContentAnalysisService(
            ManuscriptRepository manuscriptRepository,
            AIContentAnalysisRepository analysisRepository,
            PdfExtractionClient pdfExtractionClient,
            AIContentAnalysisClient aiContentAnalysisClient) {

        this.manuscriptRepository = manuscriptRepository;
        this.analysisRepository = analysisRepository;
        this.pdfExtractionClient = pdfExtractionClient;
        this.aiContentAnalysisClient = aiContentAnalysisClient;
    }

    public AIContentAnalysisResponse analyzeManuscript(
            Long manuscriptId,
            User currentUser) {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        validateOwnership(manuscript, currentUser);

        if (manuscript.getFilePath() == null ||
                manuscript.getFilePath().isBlank()) {

            throw new RuntimeException(
                    "No PDF is uploaded for this manuscript");
        }

        try {
            Path pdfPath = Path.of(manuscript.getFilePath());

            if (!Files.exists(pdfPath)) {
                throw new RuntimeException(
                        "Manuscript PDF file not found");
            }

            byte[] pdfBytes = Files.readAllBytes(pdfPath);

            String fileName = manuscript.getFileName();

            if (fileName == null || fileName.isBlank()) {
                fileName = pdfPath.getFileName().toString();
            }

            /*
             * Step 1:
             * Extract the complete text from the uploaded PDF.
             */
            PdfExtractionClient.PdfExtractionResponse extraction = pdfExtractionClient.extractText(
                    pdfBytes,
                    fileName);

            String extractedText = extraction.getExtractedText();

            if (extractedText == null ||
                    extractedText.isBlank()) {

                throw new RuntimeException(
                        "No readable text could be extracted from the PDF");
            }

            /*
             * Step 2:
             * Send extracted text to the AI-content assessment service.
             */
            AIContentAnalysisClient.AIContentResponse result = aiContentAnalysisClient.analyzeContent(
                    extractedText);

            /*
             * Step 3:
             * Persist the assessment.
             */
            AIContentAnalysis analysis = new AIContentAnalysis();

            analysis.setManuscript(manuscript);
            analysis.setAiContentIndicator(
                    result.getAiContentIndicator());
            analysis.setHumanWritingIndicator(
                    result.getHumanWritingIndicator());
            analysis.setConfidence(
                    result.getConfidence());

            List<String> signals = result.getSignals();

            analysis.setSignals(
                    signals == null || signals.isEmpty()
                            ? ""
                            : String.join("\n", signals));

            analysis.setExplanation(
                    result.getExplanation());

            AIContentAnalysis saved = analysisRepository.save(analysis);

            return toResponse(saved);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to read manuscript PDF",
                    e);
        }
    }

    public AIContentAnalysisResponse getLatestAnalysis(
            Long manuscriptId,
            User currentUser) {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        validateOwnership(manuscript, currentUser);

        return analysisRepository
                .findTopByManuscriptOrderByAnalyzedAtDesc(
                        manuscript)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException(
                        "No AI-content analysis found"));
    }

    public List<AIContentAnalysisResponse> getAnalysisHistory(
            Long manuscriptId,
            User currentUser) {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        validateOwnership(manuscript, currentUser);

        return analysisRepository
                .findByManuscriptOrderByAnalyzedAtDesc(
                        manuscript)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateOwnership(
            Manuscript manuscript,
            User currentUser) {

        boolean isOwner = manuscript.getAuthor().getId()
                .equals(currentUser.getId());

        boolean isEditor = currentUser.getRole().name().equals("EDITOR");

        if (!isOwner && !isEditor) {
            throw new RuntimeException(
                    "You are not authorized to analyze this manuscript");
        }
    }

    private AIContentAnalysisResponse toResponse(
            AIContentAnalysis analysis) {

        AIContentAnalysisResponse response = new AIContentAnalysisResponse();

        response.setId(analysis.getId());
        response.setManuscriptId(
                analysis.getManuscript().getId());
        response.setAiContentIndicator(
                analysis.getAiContentIndicator());
        response.setHumanWritingIndicator(
                analysis.getHumanWritingIndicator());
        response.setConfidence(
                analysis.getConfidence());
        response.setSignals(
                analysis.getSignals());
        response.setExplanation(
                analysis.getExplanation());
        response.setAnalyzedAt(
                analysis.getAnalyzedAt());

        return response;
    }

    @Getter
    @Setter
    public static class AIContentAnalysisResponse {

        private Long id;
        private Long manuscriptId;
        private double aiContentIndicator;
        private double humanWritingIndicator;
        private String confidence;
        private String signals;
        private String explanation;
        private java.time.LocalDateTime analyzedAt;
    }
}