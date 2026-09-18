package com.researchjournal.dto;

import com.researchjournal.entity.EditorDecision;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EditorDecisionRequest {

    @NotNull(message = "Decision is required")
    private EditorDecision decision;
}