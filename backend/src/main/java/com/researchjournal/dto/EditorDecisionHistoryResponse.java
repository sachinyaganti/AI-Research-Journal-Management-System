package com.researchjournal.dto;

import com.researchjournal.entity.EditorDecision;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EditorDecisionHistoryResponse {

    private Long id;
    private Long manuscriptId;
    private String manuscriptTitle;
    private EditorDecision decision;
    private String comments;
    private LocalDateTime decidedAt;
    private Long editorId;
    private String editorName;
}