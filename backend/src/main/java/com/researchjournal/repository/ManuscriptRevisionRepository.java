package com.researchjournal.repository;

import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.ManuscriptRevision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManuscriptRevisionRepository extends JpaRepository<ManuscriptRevision, Long> {

    List<ManuscriptRevision> findByManuscriptOrderByVersionNumberAsc(Manuscript manuscript);

    List<ManuscriptRevision> findByManuscriptOrderByVersionNumberDesc(Manuscript manuscript);

    long countByManuscript(Manuscript manuscript);
}
