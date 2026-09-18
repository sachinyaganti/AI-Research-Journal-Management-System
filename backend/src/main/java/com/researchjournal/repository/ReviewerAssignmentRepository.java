package com.researchjournal.repository;

import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.ReviewerAssignment;
import com.researchjournal.entity.ReviewerAssignmentStatus;
import com.researchjournal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewerAssignmentRepository
        extends JpaRepository<ReviewerAssignment, Long> {

    List<ReviewerAssignment> findByManuscript(
            Manuscript manuscript);

    List<ReviewerAssignment> findByReviewer(
            User reviewer);

    List<ReviewerAssignment> findByReviewerAndStatus(
            User reviewer,
            ReviewerAssignmentStatus status);

    Optional<ReviewerAssignment> findByManuscriptAndReviewer(
            Manuscript manuscript,
            User reviewer);

    boolean existsByManuscriptAndReviewer(
            Manuscript manuscript,
            User reviewer);
}