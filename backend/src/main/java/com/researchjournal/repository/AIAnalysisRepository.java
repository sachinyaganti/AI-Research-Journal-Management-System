package com.researchjournal.repository;

import com.researchjournal.entity.AIAnalysis;
import com.researchjournal.entity.Manuscript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AIAnalysisRepository
        extends JpaRepository<AIAnalysis, Long> {

    List<AIAnalysis> findByManuscriptOrderByAnalyzedAtDesc(
            Manuscript manuscript);

    Optional<AIAnalysis> findTopByManuscriptOrderByAnalyzedAtDesc(
            Manuscript manuscript);
}