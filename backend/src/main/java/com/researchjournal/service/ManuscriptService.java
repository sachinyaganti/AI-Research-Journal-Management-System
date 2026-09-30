package com.researchjournal.service;

import com.researchjournal.dto.ManuscriptRequest;
import com.researchjournal.dto.ManuscriptResponse;
import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.ManuscriptStatus;
import com.researchjournal.entity.User;
import com.researchjournal.repository.ManuscriptRepository;

import org.springframework.stereotype.Service;

import com.researchjournal.entity.Role;
import org.springframework.security.access.AccessDeniedException;
import com.researchjournal.client.AIAnalysisClient;

import com.researchjournal.repository.AIAnalysisRepository;
import com.researchjournal.entity.AIAnalysis;

import java.util.List;

@Service
public class ManuscriptService {

        private final ManuscriptRepository manuscriptRepository;
        private final AIAnalysisClient aiAnalysisClient;
        private final AIAnalysisRepository aiAnalysisRepository;

        public ManuscriptService(
                        ManuscriptRepository manuscriptRepository,
                        AIAnalysisClient aiAnalysisClient,
                        AIAnalysisRepository aiAnalysisRepository) {

                this.manuscriptRepository = manuscriptRepository;
                this.aiAnalysisClient = aiAnalysisClient;
                this.aiAnalysisRepository = aiAnalysisRepository;
        }

        public AIAnalysisClient.ManuscriptAnalysisResponse analyzeManuscript(
                        Long manuscriptId,
                        User author) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

                verifyOwnership(manuscript, author);

                AIAnalysisClient.ManuscriptAnalysisRequest request = new AIAnalysisClient.ManuscriptAnalysisRequest(
                                manuscript.getTitle(),
                                manuscript.getAbstractText(),
                                manuscript.getKeywords(),
                                manuscript.getCategory());

                AIAnalysisClient.ManuscriptAnalysisResponse response = aiAnalysisClient.analyzeManuscript(request);

                AIAnalysis analysis = AIAnalysis.builder()
                                .manuscript(manuscript)
                                .abstractQuality(response.getAbstractQuality())
                                .methodologyQuality(response.getMethodologyQuality())
                                .resultsQuality(response.getResultsQuality())
                                .conclusionQuality(response.getConclusionQuality())
                                .writingQuality(response.getWritingQuality())
                                .relevance(response.getRelevance())
                                .abstractWordCount(response.getAbstractWordCount())
                                .keywordCount(response.getKeywordCount())
                                .missingSections(
                                                String.join(
                                                                "\n",
                                                                response.getMissingSections()))
                                .writingIssues(
                                                String.join(
                                                                "\n",
                                                                response.getWritingIssues()))
                                .suggestions(
                                                String.join(
                                                                "\n",
                                                                response.getSuggestions()))
                                .build();

                aiAnalysisRepository.save(analysis);

                return response;
        }

        public ManuscriptResponse moveToUnderReview(
                        Long manuscriptId,
                        User editor) {

                if (editor.getRole() != Role.EDITOR
                                && editor.getRole() != Role.ADMIN) {

                        throw new AccessDeniedException(
                                        "Only editors and admins can move manuscripts to review");
                }

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Manuscript not found"));

                if (manuscript.getStatus() != ManuscriptStatus.SUBMITTED) {

                        throw new IllegalStateException(
                                        "Only submitted manuscripts can be moved to review");
                }

                manuscript.setStatus(
                                ManuscriptStatus.UNDER_REVIEW);

                return toResponse(
                                manuscriptRepository.save(manuscript));
        }

        public ManuscriptResponse createManuscript(
                        ManuscriptRequest request,
                        User author) {

                Manuscript manuscript = Manuscript.builder()
                                .title(request.getTitle())
                                .abstractText(request.getAbstractText())
                                .keywords(request.getKeywords())
                                .category(request.getCategory())
                                .status(ManuscriptStatus.DRAFT)
                                .author(author)
                                .build();

                Manuscript saved = manuscriptRepository.save(manuscript);

                return toResponse(saved);
        }

        public List<ManuscriptResponse> getMyManuscripts(
                        User author) {

                return manuscriptRepository
                                .findByAuthor(author)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        public ManuscriptResponse getMyManuscript(
                        Long manuscriptId,
                        User author) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Manuscript not found"));

                verifyOwnership(manuscript, author);

                return toResponse(manuscript);
        }

        public ManuscriptResponse updateManuscript(
                        Long manuscriptId,
                        ManuscriptRequest request,
                        User author) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Manuscript not found"));

                verifyOwnership(manuscript, author);

                if (manuscript.getStatus() != ManuscriptStatus.DRAFT
                                && manuscript.getStatus() != ManuscriptStatus.REVISION_REQUIRED) {

                        throw new IllegalStateException(
                                        "Only draft or revision-required manuscripts can be updated");
                }

                manuscript.setTitle(request.getTitle());
                manuscript.setAbstractText(request.getAbstractText());
                manuscript.setKeywords(request.getKeywords());
                manuscript.setCategory(request.getCategory());

                Manuscript updated = manuscriptRepository.save(manuscript);

                return toResponse(updated);
        }

        public void deleteManuscript(
                        Long manuscriptId,
                        User author) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Manuscript not found"));

                verifyOwnership(manuscript, author);

                if (manuscript.getStatus() != ManuscriptStatus.DRAFT) {
                        throw new IllegalStateException(
                                        "Only draft manuscripts can be deleted");
                }

                manuscriptRepository.delete(manuscript);
        }

        public ManuscriptResponse submitManuscript(
                        Long manuscriptId,
                        User author) {

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Manuscript not found"));

                verifyOwnership(manuscript, author);

                if (manuscript.getStatus() != ManuscriptStatus.DRAFT
                                && manuscript.getStatus() != ManuscriptStatus.REVISION_REQUIRED) {

                        throw new IllegalStateException(
                                        "Only draft or revision-required manuscripts can be submitted");
                }

                manuscript.setStatus(
                                ManuscriptStatus.SUBMITTED);

                Manuscript submitted = manuscriptRepository.save(manuscript);

                return toResponse(submitted);
        }

        public List<ManuscriptResponse> getManuscriptsByStatus(
                        ManuscriptStatus status) {

                return manuscriptRepository
                                .findByStatus(status)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        private void verifyOwnership(
                        Manuscript manuscript,
                        User author) {

                if (!manuscript.getAuthor().getId()
                                .equals(author.getId())) {

                        throw new org.springframework.security.access.AccessDeniedException(
                                        "You do not have permission to access this manuscript");
                }
        }

        private ManuscriptResponse toResponse(
                        Manuscript manuscript) {

                User author = manuscript.getAuthor();

                return new ManuscriptResponse(
                                manuscript.getId(),
                                manuscript.getTitle(),
                                manuscript.getAbstractText(),
                                manuscript.getKeywords(),
                                manuscript.getCategory(),
                                manuscript.getStatus(),
                                author.getId(),
                                author.getFullName(),
                                author.getEmail(),
                                manuscript.getCreatedAt(),
                                manuscript.getUpdatedAt(),
                                manuscript.getFileName(),
                                manuscript.getFileType(),
                                manuscript.getFileSize());
        }
}