package com.researchjournal.service;

import com.researchjournal.dto.ReviewRequest;
import com.researchjournal.dto.ReviewResponse;
import com.researchjournal.entity.*;
import com.researchjournal.repository.ManuscriptRepository;
import com.researchjournal.repository.ReviewRepository;
import com.researchjournal.repository.ReviewerAssignmentRepository;
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
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ReviewerAssignmentRepository assignmentRepository;

    @Mock
    private ManuscriptRepository manuscriptRepository;

    private ReviewService reviewService;

    private User author;
    private User reviewer;
    private User otherUser;
    private User editor;
    private Manuscript manuscript;
    private ReviewerAssignment assignment;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, assignmentRepository, manuscriptRepository);

        author = User.builder().id(10L).fullName("Author One").email("author@test.com").role(Role.AUTHOR).build();
        reviewer = User.builder().id(20L).fullName("Reviewer One").email("reviewer@test.com").role(Role.REVIEWER).build();
        otherUser = User.builder().id(30L).fullName("Intruder").email("intruder@test.com").role(Role.REVIEWER).build();
        editor = User.builder().id(40L).fullName("Editor One").email("editor@test.com").role(Role.EDITOR).build();

        manuscript = Manuscript.builder()
                .id(100L)
                .title("Sample Research Paper")
                .author(author)
                .status(ManuscriptStatus.UNDER_REVIEW)
                .build();

        assignment = ReviewerAssignment.builder()
                .id(200L)
                .manuscript(manuscript)
                .reviewer(reviewer)
                .status(ReviewerAssignmentStatus.IN_REVIEW)
                .build();
    }

    @Test
    void submitReview_ValidSubmission_Success() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(5);
        request.setComments("Solid paper, clear methodology.");
        request.setCommentsToAuthor("Author feedback: refine charts.");
        request.setConfidentialCommentsToEditor("Editor note: accept with minor revisions.");
        request.setClarityRating(4);
        request.setMethodologyRating(5);
        request.setOriginalityRating(4);
        request.setRecommendation(ReviewRecommendation.MINOR_REVISION);

        when(assignmentRepository.findById(200L)).thenReturn(Optional.of(assignment));
        when(reviewRepository.existsByAssignment(assignment)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review r = invocation.getArgument(0);
            r.setId(500L);
            return r;
        });

        ReviewResponse response = reviewService.submitReview(200L, request, reviewer);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals("Editor note: accept with minor revisions.", response.getConfidentialCommentsToEditor());
        assertEquals(ReviewerAssignmentStatus.COMPLETED, assignment.getStatus());
        verify(assignmentRepository).save(assignment);
    }

    @Test
    void submitReview_UnauthorizedReviewer_ThrowsAccessDenied() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);
        request.setComments("Test");
        request.setRecommendation(ReviewRecommendation.ACCEPT);

        when(assignmentRepository.findById(200L)).thenReturn(Optional.of(assignment));

        assertThrows(AccessDeniedException.class, () -> reviewService.submitReview(200L, request, otherUser));
    }

    @Test
    void submitReview_DuplicateReview_ThrowsIllegalState() {
        ReviewRequest request = new ReviewRequest();
        request.setRating(4);
        request.setComments("Test");
        request.setRecommendation(ReviewRecommendation.ACCEPT);

        when(assignmentRepository.findById(200L)).thenReturn(Optional.of(assignment));
        when(reviewRepository.existsByAssignment(assignment)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> reviewService.submitReview(200L, request, reviewer));
    }

    @Test
    void getManuscriptReviews_AuthorNeverSeesConfidentialEditorComments() {
        manuscript.setStatus(ManuscriptStatus.REVISION_REQUIRED);

        Review review = Review.builder()
                .id(501L)
                .assignment(assignment)
                .rating(4)
                .comments("Public comments")
                .commentsToAuthor("Public comments to author")
                .confidentialCommentsToEditor("SECRET: The data in figure 2 looks suspicious")
                .recommendation(ReviewRecommendation.MAJOR_REVISION)
                .build();

        when(manuscriptRepository.findById(100L)).thenReturn(Optional.of(manuscript));
        when(reviewRepository.findByAssignment_Manuscript(manuscript)).thenReturn(List.of(review));

        // When author requests reviews:
        List<ReviewResponse> authorResponses = reviewService.getManuscriptReviews(100L, author);
        assertNotNull(authorResponses);
        assertEquals(1, authorResponses.size());
        assertNull(authorResponses.get(0).getConfidentialCommentsToEditor(), "Author MUST NEVER see confidential editor comments!");
        assertEquals("Anonymous Reviewer", authorResponses.get(0).getReviewerName(), "Reviewer identity is blinded to author");

        // When editor requests reviews:
        List<ReviewResponse> editorResponses = reviewService.getManuscriptReviews(100L, editor);
        assertNotNull(editorResponses);
        assertEquals(1, editorResponses.size());
        assertEquals("SECRET: The data in figure 2 looks suspicious", editorResponses.get(0).getConfidentialCommentsToEditor(), "Editor can see confidential comments");
        assertEquals("Reviewer One", editorResponses.get(0).getReviewerName());
    }
}
