package com.researchjournal.controller;

import com.researchjournal.dto.EditorDecisionRequest;
import com.researchjournal.dto.EditorDecisionResponse;
import com.researchjournal.entity.User;
import com.researchjournal.service.EditorDecisionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.researchjournal.dto.EditorDecisionHistoryResponse;
import java.util.List;

@RestController
@RequestMapping("/api")
public class EditorDecisionController {

    private final EditorDecisionService editorDecisionService;

    public EditorDecisionController(
            EditorDecisionService editorDecisionService) {

        this.editorDecisionService = editorDecisionService;
    }

    @PostMapping("/manuscripts/{manuscriptId}/decision")
    @ResponseStatus(HttpStatus.OK)
    public EditorDecisionResponse makeDecision(
            @PathVariable Long manuscriptId,
            @Valid @RequestBody EditorDecisionRequest request,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        return editorDecisionService.makeDecision(
                manuscriptId,
                request,
                currentUser);
    }

    @GetMapping("/manuscripts/{manuscriptId}/decision-history")
    public List<EditorDecisionHistoryResponse> getDecisionHistory(
            @PathVariable Long manuscriptId,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        return editorDecisionService.getDecisionHistory(
                manuscriptId,
                currentUser);
    }
}