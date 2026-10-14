package com.researchjournal.service;

import com.researchjournal.client.AIAnalysisClient;
import com.researchjournal.dto.ManuscriptResponse;
import com.researchjournal.dto.PublicationRequest;
import com.researchjournal.entity.*;
import com.researchjournal.repository.AIAnalysisRepository;
import com.researchjournal.repository.ManuscriptRepository;
import com.researchjournal.repository.ManuscriptRevisionRepository;
import com.researchjournal.repository.ReviewerAssignmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RevisionAndPublicationWorkflowTest {

    @Mock
    private ManuscriptRepository manuscriptRepository;

    @Mock
    private AIAnalysisClient aiAnalysisClient;

    @Mock
    private AIAnalysisRepository aiAnalysisRepository;

    @Mock
    private ManuscriptRevisionRepository revisionRepository;

    @Mock
    private ReviewerAssignmentRepository assignmentRepository;

    @Mock
    private ManuscriptFileService manuscriptFileService;

    private ManuscriptService manuscriptService;

    private User author;
    private User editor;
    private User reviewer;
    private Manuscript manuscript;

    @BeforeEach
    void setUp() {
        manuscriptService = new ManuscriptService(
                manuscriptRepository,
                aiAnalysisClient,
                aiAnalysisRepository,
                revisionRepository,
                assignmentRepository,
                manuscriptFileService
        );

        author = User.builder().id(10L).fullName("Author Dr.").email("author@test.com").role(Role.AUTHOR).build();
        editor = User.builder().id(20L).fullName("Chief Editor").email("editor@test.com").role(Role.EDITOR).build();
        reviewer = User.builder().id(30L).fullName("Peer Reviewer").email("rev@test.com").role(Role.REVIEWER).build();

        manuscript = Manuscript.builder()
                .id(100L)
                .title("Quantum Optimization in NLP")
                .author(author)
                .status(ManuscriptStatus.REVISION_REQUIRED)
                .fileName("original_v1.pdf")
                .filePath("uploads/manuscripts/v1.pdf")
                .fileSize(1024L)
                .build();
    }

    @Test
    void submitRevision_ValidRevision_ArchivesVersionAndResubmits() throws IOException {
        MockMultipartFile revisedPdf = new MockMultipartFile(
                "file",
                "revised_v2.pdf",
                "application/pdf",
                new byte[]{1, 2, 3, 4}
        );

        when(manuscriptRepository.findById(100L)).thenReturn(Optional.of(manuscript));
        when(revisionRepository.countByManuscript(manuscript)).thenReturn(0L);

        Manuscript updatedAfterUpload = Manuscript.builder()
                .id(100L)
                .title("Quantum Optimization in NLP")
                .author(author)
                .status(ManuscriptStatus.REVISION_REQUIRED)
                .fileName("revised_v2.pdf")
                .filePath("uploads/manuscripts/v2.pdf")
                .fileSize(2048L)
                .build();

        when(manuscriptFileService.uploadFile(eq(100L), any())).thenReturn(updatedAfterUpload);
        when(manuscriptRepository.save(any(Manuscript.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ManuscriptResponse response = manuscriptService.submitRevision(100L, "Addressed reviewer comments regarding table 2.", revisedPdf, author);

        assertNotNull(response);
        assertEquals(ManuscriptStatus.SUBMITTED, response.getStatus());
        verify(revisionRepository).save(argThat(r ->
                r.getVersionNumber() == 1
                && r.getFileName().equals("original_v1.pdf")
                && r.getResponseNotes().contains("Addressed reviewer comments")
        ));
    }

    @Test
    void submitRevision_NonAuthor_ThrowsAccessDenied() {
        MockMultipartFile revisedPdf = new MockMultipartFile("file", "v2.pdf", "application/pdf", new byte[]{1, 2});
        when(manuscriptRepository.findById(100L)).thenReturn(Optional.of(manuscript));

        assertThrows(AccessDeniedException.class, () ->
                manuscriptService.submitRevision(100L, "Notes", revisedPdf, reviewer)
        );
    }

    @Test
    void publishManuscript_AcceptedManuscript_Success() {
        manuscript.setStatus(ManuscriptStatus.ACCEPTED);
        when(manuscriptRepository.findById(100L)).thenReturn(Optional.of(manuscript));
        when(manuscriptRepository.save(any(Manuscript.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PublicationRequest pubReq = new PublicationRequest("Volume 14", "Issue 2", "10.1234/ai-journal.2026.01", "Accepted for special issue");

        ManuscriptResponse response = manuscriptService.publishManuscript(100L, pubReq, editor);

        assertNotNull(response);
        assertEquals(ManuscriptStatus.PUBLISHED, response.getStatus());
        assertNotNull(response.getPublishedAt());
        assertEquals("Volume 14", response.getVolume());
        assertEquals("Issue 2", response.getIssue());
        assertEquals("10.1234/ai-journal.2026.01", response.getDoi());
    }

    @Test
    void publishManuscript_NotAcceptedStatus_ThrowsIllegalStateException() {
        manuscript.setStatus(ManuscriptStatus.UNDER_REVIEW);
        when(manuscriptRepository.findById(100L)).thenReturn(Optional.of(manuscript));

        PublicationRequest pubReq = new PublicationRequest("Vol 1", "Issue 1", null, null);

        assertThrows(IllegalStateException.class, () ->
                manuscriptService.publishManuscript(100L, pubReq, editor)
        );
    }

    @Test
    void publishManuscript_NonEditor_ThrowsAccessDenied() {
        PublicationRequest pubReq = new PublicationRequest("Vol 1", "Issue 1", null, null);

        assertThrows(AccessDeniedException.class, () ->
                manuscriptService.publishManuscript(100L, pubReq, author)
        );
    }

    @Test
    void getPublishedManuscripts_ReturnsPublishedList() {
        Manuscript published = Manuscript.builder()
                .id(101L)
                .title("Published Discovery")
                .author(author)
                .status(ManuscriptStatus.PUBLISHED)
                .build();

        when(manuscriptRepository.findByStatus(ManuscriptStatus.PUBLISHED)).thenReturn(List.of(published));

        List<ManuscriptResponse> list = manuscriptService.getPublishedManuscripts();

        assertEquals(1, list.size());
        assertEquals("Published Discovery", list.get(0).getTitle());
    }
}
