package com.researchjournal.repository;

import com.researchjournal.entity.AIContentAnalysis;
import com.researchjournal.entity.Manuscript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AIContentAnalysisRepository
        extends JpaRepository<AIContentAnalysis, Long> {

    List<AIContentAnalysis> findByManuscriptOrderByAnalyzedAtDesc(
            Manuscript manuscript);

    Optional<AIContentAnalysis> findTopByManuscriptOrderByAnalyzedAtDesc(
            Manuscript manuscript);
}