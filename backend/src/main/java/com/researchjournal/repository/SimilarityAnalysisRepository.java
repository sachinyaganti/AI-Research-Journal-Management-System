package com.researchjournal.repository;

import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.SimilarityAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SimilarityAnalysisRepository
        extends JpaRepository<SimilarityAnalysis, Long> {

    List<SimilarityAnalysis> findByManuscriptOrderByAnalyzedAtDesc(
            Manuscript manuscript);

    Optional<SimilarityAnalysis> findTopByManuscriptOrderByAnalyzedAtDesc(
            Manuscript manuscript);
}