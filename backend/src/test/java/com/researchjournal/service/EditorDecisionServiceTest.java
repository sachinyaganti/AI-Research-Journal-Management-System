package com.researchjournal.service;

import com.researchjournal.dto.EditorDecisionHistoryResponse;
import com.researchjournal.dto.EditorDecisionRequest;
import com.researchjournal.dto.EditorDecisionResponse;
import com.researchjournal.entity.*;
import com.researchjournal.repository.EditorDecisionRepository;
import com.researchjournal.repository.ManuscriptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EditorDecisionServiceTest {

    @Mock
    private ManuscriptRepository manuscriptRepository;

    @Mock
    private EditorDecisionRepository decisionRepository;

    private EditorDecisionService editorDecisionService;

    private User editor;
    private User author;
    private User reviewer;
    private Manuscript manuscript;

    @BeforeEach
    void setUp() {
        editorDecisionService = new EditorDecisionService(manuscriptRepository, decisionRepository);

        editor = User.builder().id(1L).fullName("Editor Chief").email("editor@test.com").role(Role.EDITOR).build();
        author = User.builder().id(2L).fullName("Author Dr.").email("author@test.com").role(Role.AUTHOR).build();
        reviewer = User.builder().id(3L).fullName("Reviewer Prof.").email("rev@test.com").role(Role.REVIEWER).build();

        manuscript = Manuscript.builder()
                .id(10L)
                .title("Advanced AI Research")
                .author(author)
                .status(ManuscriptStatus.UNDER_REVIEW)
                .build();
    }

    @Test
    void makeDecision_RevisionRequiredWithoutComments_ThrowsIllegalArgumentException() {
        EditorDecisionRequest request = new EditorDecisionRequest();
        request.setDecision(EditorDecision.REVISION_REQUIRED);
        request.setComments(""); // Blank comments

        when(manuscriptRepository.findById(10L)).thenReturn(Optional.of(manuscript));

        assertThrows(IllegalArgumentException.class, () ->
                editorDecisionService.makeDecision(10L, request, editor)
        );
    }

    @Test
    void makeDecision_RevisionRequiredWithComments_Success() {
        EditorDecisionRequest request = new EditorDecisionRequest();
        request.setDecision(EditorDecision.REVISION_REQUIRED);
        request.setComments("Please address reviewer 1 comments and re-upload.");

        when(manuscriptRepository.findById(10L)).thenReturn(Optional.of(manuscript));
        when(manuscriptRepository.save(any(Manuscript.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EditorDecisionResponse response = editorDecisionService.makeDecision(10L, request, editor);

        assertNotNull(response);
        assertEquals(ManuscriptStatus.REVISION_REQUIRED, response.getManuscriptStatus());
        assertEquals("Please address reviewer 1 comments and re-upload.", response.getComments());
        verify(decisionRepository).save(any(EditorDecisionRecord.class));
    }

    @Test
    void makeDecision_NonEditor_ThrowsAccessDenied() {
        EditorDecisionRequest request = new EditorDecisionRequest();
        request.setDecision(EditorDecision.ACCEPTED);

        assertThrows(AccessDeniedException.class, () ->
                editorDecisionService.makeDecision(10L, request, reviewer)
        );
    }

    @Test
    void makeDecision_ManuscriptNotUnderReview_ThrowsIllegalState() {
        manuscript.setStatus(ManuscriptStatus.DRAFT);
        when(manuscriptRepository.findById(10L)).thenReturn(Optional.of(manuscript));

        EditorDecisionRequest request = new EditorDecisionRequest();
        request.setDecision(EditorDecision.ACCEPTED);

        assertThrows(IllegalStateException.class, () ->
                editorDecisionService.makeDecision(10L, request, editor)
        );
    }

    @Test
    void getDecisionHistory_AuthorCanViewOwnManuscriptHistory() {
        EditorDecisionRecord record = EditorDecisionRecord.builder()
                .id(100L)
                .manuscript(manuscript)
                .editor(editor)
                .decision(EditorDecision.REVISION_REQUIRED)
                .comments("Revisions required")
                .build();

        when(manuscriptRepository.findById(10L)).thenReturn(Optional.of(manuscript));
        when(decisionRepository.findByManuscript(manuscript)).thenReturn(List.of(record));

        List<EditorDecisionHistoryResponse> history = editorDecisionService.getDecisionHistory(10L, author);

        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals(EditorDecision.REVISION_REQUIRED, history.get(0).getDecision());
    }
}
