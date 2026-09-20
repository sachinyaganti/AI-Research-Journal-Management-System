package com.researchjournal.service;

import com.researchjournal.dto.AIAnalysisResponse;
import com.researchjournal.entity.AIAnalysis;
import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.User;
import com.researchjournal.repository.AIAnalysisRepository;
import com.researchjournal.repository.ManuscriptRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@Service
public class AIAnalysisService {

    private final AIAnalysisRepository aiAnalysisRepository;
    private final ManuscriptRepository manuscriptRepository;

    public AIAnalysisService(
            AIAnalysisRepository aiAnalysisRepository,
            ManuscriptRepository manuscriptRepository) {

        this.aiAnalysisRepository = aiAnalysisRepository;
        this.manuscriptRepository = manuscriptRepository;
    }

    public AIAnalysisResponse getLatestAnalysis(
            Long manuscriptId,
            User author) {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        if (!manuscript.getAuthor().getId()
                .equals(author.getId())) {

            throw new AccessDeniedException(
                    "You do not have permission to access this manuscript");
        }

        AIAnalysis analysis = aiAnalysisRepository
                .findTopByManuscriptOrderByAnalyzedAtDesc(manuscript)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No AI analysis found for this manuscript"));

        return toResponse(analysis);
    }

    private AIAnalysisResponse toResponse(
            AIAnalysis analysis) {

        Manuscript manuscript = analysis.getManuscript();

        return new AIAnalysisResponse(
                analysis.getId(),
                manuscript.getId(),
                manuscript.getTitle(),
                analysis.getAbstractQuality(),
                analysis.getMethodologyQuality(),
                analysis.getResultsQuality(),
                analysis.getConclusionQuality(),
                analysis.getWritingQuality(),
                analysis.getRelevance(),
                analysis.getAbstractWordCount(),
                analysis.getKeywordCount(),
                splitLines(analysis.getMissingSections()),
                splitLines(analysis.getWritingIssues()),
                splitLines(analysis.getSuggestions()),
                analysis.getAnalyzedAt());
    }

    private List<String> splitLines(String value) {

        if (value == null || value.isBlank()) {
            return List.of();
        }

        return Arrays.stream(value.split("\\R"))
                .filter(line -> !line.isBlank())
                .toList();
    }
}