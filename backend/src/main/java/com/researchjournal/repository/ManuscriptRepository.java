package com.researchjournal.repository;

import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.ManuscriptStatus;
import com.researchjournal.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManuscriptRepository
        extends JpaRepository<Manuscript, Long> {

    List<Manuscript> findByAuthor(User author);

    List<Manuscript> findByStatus(ManuscriptStatus status);

    List<Manuscript> findByAuthorAndStatus(
            User author,
            ManuscriptStatus status);
}