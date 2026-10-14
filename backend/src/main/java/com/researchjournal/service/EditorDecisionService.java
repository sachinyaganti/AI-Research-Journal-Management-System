package com.researchjournal.service;

import com.researchjournal.dto.EditorDecisionRequest;
import com.researchjournal.dto.EditorDecisionResponse;
import com.researchjournal.entity.EditorDecision;
import com.researchjournal.entity.EditorDecisionRecord;
import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.ManuscriptStatus;
import com.researchjournal.entity.Role;
import com.researchjournal.entity.User;
import com.researchjournal.repository.EditorDecisionRepository;
import com.researchjournal.repository.ManuscriptRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.researchjournal.dto.EditorDecisionHistoryResponse;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class EditorDecisionService {

    private final ManuscriptRepository manuscriptRepository;
    private final EditorDecisionRepository decisionRepository;

    public EditorDecisionService(
            ManuscriptRepository manuscriptRepository,
            EditorDecisionRepository decisionRepository) {

        this.manuscriptRepository = manuscriptRepository;
        this.decisionRepository = decisionRepository;
    }

    public EditorDecisionResponse makeDecision(
            Long manuscriptId,
            EditorDecisionRequest request,
            User editor) {

        if (editor.getRole() != Role.EDITOR
                && editor.getRole() != Role.ADMIN) {

            throw new AccessDeniedException(
                    "Only editors and admins can make manuscript decisions");
        }

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException(
                        "Manuscript not found"));

        if (manuscript.getStatus() != ManuscriptStatus.UNDER_REVIEW) {

            throw new IllegalStateException(
                    "Only manuscripts under review can receive an editor decision");
        }

        EditorDecision decision = request.getDecision();

        if ((decision == EditorDecision.REVISION_REQUIRED || decision == EditorDecision.REJECTED)
                && (request.getComments() == null || request.getComments().trim().isEmpty())) {
            throw new IllegalArgumentException(
                    "Decision comments or instructions are required for " + decision.name().replace('_', ' ').toLowerCase());
        }

        ManuscriptStatus newStatus;

        switch (decision) {
            case ACCEPTED:
                newStatus = ManuscriptStatus.ACCEPTED;
                break;

            case REVISION_REQUIRED:
                newStatus = ManuscriptStatus.REVISION_REQUIRED;
                break;

            case REJECTED:
                newStatus = ManuscriptStatus.REJECTED;
                break;

            default:
                throw new IllegalArgumentException(
                        "Invalid editor decision");
        }

        manuscript.setStatus(newStatus);

        Manuscript savedManuscript = manuscriptRepository.save(manuscript);

        EditorDecisionRecord decisionRecord = EditorDecisionRecord.builder()
                .manuscript(savedManuscript)
                .editor(editor)
                .decision(decision)
                .comments(request.getComments())
                .build();

        decisionRepository.save(decisionRecord);

        return EditorDecisionResponse.builder()
                .manuscriptId(savedManuscript.getId())
                .manuscriptTitle(savedManuscript.getTitle())
                .decision(decision)
                .manuscriptStatus(savedManuscript.getStatus())
                .comments(request.getComments())
                .decidedAt(LocalDateTime.now())
                .editorId(editor.getId())
                .editorName(editor.getFullName())
                .build();
    }

    public List<EditorDecisionHistoryResponse> getDecisionHistory(
            Long manuscriptId,
            User currentUser) {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException(
                        "Manuscript not found"));

        boolean isEditorOrAdmin = currentUser.getRole() == Role.EDITOR
                || currentUser.getRole() == Role.ADMIN;
        boolean isAuthor = manuscript.getAuthor().getId().equals(currentUser.getId());

        if (!isEditorOrAdmin && !isAuthor) {
            throw new AccessDeniedException(
                    "Only editors, admins, or the manuscript author can view decision history");
        }

        return decisionRepository
                .findByManuscript(manuscript)
                .stream()
                .map(decision -> EditorDecisionHistoryResponse.builder()
                        .id(decision.getId())
                        .manuscriptId(manuscript.getId())
                        .manuscriptTitle(manuscript.getTitle())
                        .decision(decision.getDecision())
                        .comments(decision.getComments())
                        .decidedAt(decision.getDecidedAt())
                        .editorId(decision.getEditor().getId())
                        .editorName(decision.getEditor().getFullName())
                        .build())
                .toList();
    }
}