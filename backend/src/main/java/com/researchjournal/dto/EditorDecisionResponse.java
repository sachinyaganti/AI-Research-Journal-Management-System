package com.researchjournal.dto;

import com.researchjournal.entity.EditorDecision;
import com.researchjournal.entity.ManuscriptStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EditorDecisionResponse {

    private Long manuscriptId;

    private String manuscriptTitle;

    private EditorDecision decision;

    private ManuscriptStatus manuscriptStatus;

    private LocalDateTime decidedAt;

    private Long editorId;

    private String editorName;
}