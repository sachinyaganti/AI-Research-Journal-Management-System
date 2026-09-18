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
                .build();

        decisionRepository.save(decisionRecord);

        return new EditorDecisionResponse(
                savedManuscript.getId(),
                savedManuscript.getTitle(),
                decision,
                savedManuscript.getStatus(),
                LocalDateTime.now(),
                editor.getId(),
                editor.getFullName());
    }

    public List<EditorDecisionHistoryResponse> getDecisionHistory(
            Long manuscriptId,
            User currentUser) {

        if (currentUser.getRole() != Role.EDITOR
                && currentUser.getRole() != Role.ADMIN) {

            throw new AccessDeniedException(
                    "Only editors and admins can view decision history");
        }

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new RuntimeException(
                        "Manuscript not found"));

        return decisionRepository
                .findByManuscript(manuscript)
                .stream()
                .map(decision -> new EditorDecisionHistoryResponse(
                        decision.getId(),
                        manuscript.getId(),
                        manuscript.getTitle(),
                        decision.getDecision(),
                        decision.getDecidedAt(),
                        decision.getEditor().getId(),
                        decision.getEditor().getFullName()))
                .toList();
    }
}