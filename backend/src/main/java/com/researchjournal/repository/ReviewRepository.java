package com.researchjournal.repository;

import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.Review;
import com.researchjournal.entity.ReviewerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByAssignment(
            ReviewerAssignment assignment);

    boolean existsByAssignment(
            ReviewerAssignment assignment);

    List<Review> findByAssignment_Manuscript(
            Manuscript manuscript);
}