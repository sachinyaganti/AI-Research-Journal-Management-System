package com.researchjournal.dto;

import com.researchjournal.entity.EditorDecision;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EditorDecisionHistoryResponse {

    private Long id;
    private Long manuscriptId;
    private String manuscriptTitle;
    private EditorDecision decision;
    private LocalDateTime decidedAt;
    private Long editorId;
    private String editorName;
}