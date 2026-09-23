package com.researchjournal.service;

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

        private final ManuscriptRepository manuscriptRepository;
        private final SimilarityAnalysisRepository similarityAnalysisRepository;
        private final SimilarityAnalysisClient similarityAnalysisClient;

        public SimilarityAnalysisService(
                        ManuscriptRepository manuscriptRepository,
                        SimilarityAnalysisRepository similarityAnalysisRepository,
                        SimilarityAnalysisClient similarityAnalysisClient) {

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
                                .map(other -> new SimilarityAnalysisClient.SimilarityCandidate(
                                                other.getId(),
                                                other.getTitle(),
                                                other.getAbstractText()))
                                .toList();

                SimilarityAnalysisClient.SimilarityAnalysisRequest request = new SimilarityAnalysisClient.SimilarityAnalysisRequest(
                                manuscript.getId(),
                                manuscript.getTitle(),
                                manuscript.getAbstractText(),
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