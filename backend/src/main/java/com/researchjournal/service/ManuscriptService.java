package com.researchjournal.service;

import com.researchjournal.client.AIAnalysisClient;
import com.researchjournal.dto.ManuscriptRequest;
import com.researchjournal.dto.ManuscriptResponse;
import com.researchjournal.dto.ManuscriptRevisionResponse;
import com.researchjournal.dto.PublicationRequest;
import com.researchjournal.entity.*;
import com.researchjournal.repository.AIAnalysisRepository;
import com.researchjournal.repository.ManuscriptRepository;
import com.researchjournal.repository.ManuscriptRevisionRepository;
import com.researchjournal.repository.ReviewerAssignmentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ManuscriptService {

    private final ManuscriptRepository manuscriptRepository;
    private final AIAnalysisClient aiAnalysisClient;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final ManuscriptRevisionRepository revisionRepository;
    private final ReviewerAssignmentRepository assignmentRepository;
    private final ManuscriptFileService manuscriptFileService;

    public ManuscriptService(
            ManuscriptRepository manuscriptRepository,
            AIAnalysisClient aiAnalysisClient,
            AIAnalysisRepository aiAnalysisRepository,
            ManuscriptRevisionRepository revisionRepository,
            ReviewerAssignmentRepository assignmentRepository,
            ManuscriptFileService manuscriptFileService) {

        this.manuscriptRepository = manuscriptRepository;
        this.aiAnalysisClient = aiAnalysisClient;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.revisionRepository = revisionRepository;
        this.assignmentRepository = assignmentRepository;
        this.manuscriptFileService = manuscriptFileService;
    }

    public AIAnalysisClient.ManuscriptAnalysisResponse analyzeManuscript(
            Long manuscriptId,
            User author) {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        verifyAccess(manuscript, author);

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
                .missingSections(String.join("\n", response.getMissingSections()))
                .writingIssues(String.join("\n", response.getWritingIssues()))
                .suggestions(String.join("\n", response.getSuggestions()))
                .build();

        aiAnalysisRepository.save(analysis);

        return response;
    }

    public ManuscriptResponse moveToUnderReview(
            Long manuscriptId,
            User editor) {

        if (editor.getRole() != Role.EDITOR && editor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only editors and admins can move manuscripts to review");
        }

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new IllegalArgumentException("Manuscript not found"));

        if (manuscript.getStatus() != ManuscriptStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted manuscripts can be moved to review");
        }

        manuscript.setStatus(ManuscriptStatus.UNDER_REVIEW);

        return toResponse(manuscriptRepository.save(manuscript));
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

    public List<ManuscriptResponse> getMyManuscripts(User author) {
        return manuscriptRepository
                .findByAuthor(author)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ManuscriptResponse getMyManuscript(Long manuscriptId, User currentUser) {
        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        verifyAccess(manuscript, currentUser);

        return toResponse(manuscript);
    }

    public ManuscriptResponse updateManuscript(
            Long manuscriptId,
            ManuscriptRequest request,
            User author) {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        verifyOwnership(manuscript, author);

        if (manuscript.getStatus() != ManuscriptStatus.DRAFT
                && manuscript.getStatus() != ManuscriptStatus.REVISION_REQUIRED) {

            throw new IllegalStateException("Only draft or revision-required manuscripts can be updated");
        }

        manuscript.setTitle(request.getTitle());
        manuscript.setAbstractText(request.getAbstractText());
        manuscript.setKeywords(request.getKeywords());
        manuscript.setCategory(request.getCategory());

        Manuscript updated = manuscriptRepository.save(manuscript);

        return toResponse(updated);
    }

    public void deleteManuscript(Long manuscriptId, User author) {
        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        verifyOwnership(manuscript, author);

        if (manuscript.getStatus() != ManuscriptStatus.DRAFT) {
            throw new IllegalStateException("Only draft manuscripts can be deleted");
        }

        manuscriptRepository.delete(manuscript);
    }

    public ManuscriptResponse submitManuscript(Long manuscriptId, User author) {
        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        verifyOwnership(manuscript, author);

        if (manuscript.getStatus() != ManuscriptStatus.DRAFT
                && manuscript.getStatus() != ManuscriptStatus.REVISION_REQUIRED) {

            throw new IllegalStateException("Only draft or revision-required manuscripts can be submitted");
        }
        if (manuscript.getFilePath() == null || manuscript.getFilePath().isBlank()) {
            throw new IllegalStateException("A research paper PDF must be uploaded before submission");
        }
        if (!manuscript.isScreeningCompleted()) {
            throw new IllegalStateException("Pre-publication screening must be completed before submission");
        }
        manuscript.setStatus(ManuscriptStatus.SUBMITTED);

        Manuscript submitted = manuscriptRepository.save(manuscript);

        return toResponse(submitted);
    }

    public ManuscriptResponse submitRevision(
            Long manuscriptId,
            String responseNotes,
            MultipartFile file,
            User author) throws IOException {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        verifyOwnership(manuscript, author);

        if (manuscript.getStatus() != ManuscriptStatus.REVISION_REQUIRED) {
            throw new IllegalStateException("Only manuscripts requiring revision can be revised");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A revised PDF file must be provided");
        }

        // Preserve previous manuscript version in revision record
        long existingRevisions = revisionRepository.countByManuscript(manuscript);
        int versionNumber = (int) existingRevisions + 1;

        ManuscriptRevision revision = ManuscriptRevision.builder()
                .manuscript(manuscript)
                .versionNumber(versionNumber)
                .responseNotes(responseNotes != null ? responseNotes.trim() : "")
                .fileName(manuscript.getFileName())
                .filePath(manuscript.getFilePath())
                .fileSize(manuscript.getFileSize())
                .submittedAt(LocalDateTime.now())
                .build();
        revisionRepository.save(revision);

        // Upload revised PDF (preserves both without overwriting disk path)
        manuscript = manuscriptFileService.uploadFile(manuscriptId, file);

        // Transition back to SUBMITTED for editorial handling
        manuscript.setStatus(ManuscriptStatus.SUBMITTED);
        manuscript.setScreeningCompleted(true);

        return toResponse(manuscriptRepository.save(manuscript));
    }

    public List<ManuscriptRevisionResponse> getRevisions(Long manuscriptId, User currentUser) {
        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        verifyAccess(manuscript, currentUser);

        return revisionRepository.findByManuscriptOrderByVersionNumberAsc(manuscript)
                .stream()
                .map(r -> ManuscriptRevisionResponse.builder()
                        .id(r.getId())
                        .manuscriptId(manuscript.getId())
                        .versionNumber(r.getVersionNumber())
                        .responseNotes(r.getResponseNotes())
                        .fileName(r.getFileName())
                        .fileSize(r.getFileSize())
                        .submittedAt(r.getSubmittedAt())
                        .build())
                .toList();
    }

    public ManuscriptResponse publishManuscript(
            Long manuscriptId,
            PublicationRequest request,
            User editor) {

        if (editor.getRole() != Role.EDITOR && editor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only editors and admins can publish manuscripts");
        }

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException("Manuscript not found"));

        if (manuscript.getStatus() != ManuscriptStatus.ACCEPTED) {
            throw new IllegalStateException("Only accepted manuscripts can be published");
        }

        manuscript.setStatus(ManuscriptStatus.PUBLISHED);
        manuscript.setPublishedAt(LocalDateTime.now());
        manuscript.setVolume(request.getVolume());
        manuscript.setIssue(request.getIssue());
        manuscript.setDoi(request.getDoi());
        manuscript.setPublicationNotes(request.getPublicationNotes());

        return toResponse(manuscriptRepository.save(manuscript));
    }

    public List<ManuscriptResponse> getPublishedManuscripts() {
        return manuscriptRepository
                .findByStatus(ManuscriptStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ManuscriptResponse> getManuscriptsByStatus(ManuscriptStatus status) {
        return manuscriptRepository
                .findByStatus(status)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void verifyOwnership(Manuscript manuscript, User author) {
        if (!manuscript.getAuthor().getId().equals(author.getId())) {
            throw new AccessDeniedException("You do not have permission to access this manuscript");
        }
    }

    private void verifyAccess(Manuscript manuscript, User currentUser) {
        if (manuscript.getStatus() == ManuscriptStatus.PUBLISHED) {
            return; // Published manuscripts are publicly readable
        }
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required");
        }
        boolean isOwner = manuscript.getAuthor().getId().equals(currentUser.getId());
        boolean isEditorOrAdmin = currentUser.getRole() == Role.EDITOR || currentUser.getRole() == Role.ADMIN;
        boolean isAssignedReviewer = assignmentRepository.existsByManuscriptAndReviewer(manuscript, currentUser);

        if (!isOwner && !isEditorOrAdmin && !isAssignedReviewer) {
            throw new AccessDeniedException("You do not have permission to access this manuscript");
        }
    }

    private ManuscriptResponse toResponse(Manuscript manuscript) {
        User author = manuscript.getAuthor();

        return ManuscriptResponse.builder()
                .id(manuscript.getId())
                .title(manuscript.getTitle())
                .abstractText(manuscript.getAbstractText())
                .keywords(manuscript.getKeywords())
                .category(manuscript.getCategory())
                .status(manuscript.getStatus())
                .authorId(author.getId())
                .authorName(author.getFullName())
                .authorEmail(author.getEmail())
                .createdAt(manuscript.getCreatedAt())
                .updatedAt(manuscript.getUpdatedAt())
                .fileName(manuscript.getFileName())
                .fileType(manuscript.getFileType())
                .fileSize(manuscript.getFileSize())
                .publishedAt(manuscript.getPublishedAt())
                .volume(manuscript.getVolume())
                .issue(manuscript.getIssue())
                .doi(manuscript.getDoi())
                .publicationNotes(manuscript.getPublicationNotes())
                .build();
    }
}