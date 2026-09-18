package com.researchjournal.repository;

import com.researchjournal.entity.EditorDecisionRecord;
import com.researchjournal.entity.Manuscript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EditorDecisionRepository
        extends JpaRepository<EditorDecisionRecord, Long> {

    List<EditorDecisionRecord> findByManuscript(
            Manuscript manuscript);

    Optional<EditorDecisionRecord> findTopByManuscriptOrderByDecidedAtDesc(
            Manuscript manuscript);
}