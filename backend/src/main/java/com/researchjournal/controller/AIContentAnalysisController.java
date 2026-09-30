package com.researchjournal.controller;

import com.researchjournal.entity.User;
import com.researchjournal.repository.UserRepository;
import com.researchjournal.service.AIContentAnalysisService;
import com.researchjournal.service.AIContentAnalysisService.AIContentAnalysisResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manuscripts")
public class AIContentAnalysisController {

    private final AIContentAnalysisService analysisService;
    private final UserRepository userRepository;

    public AIContentAnalysisController(
            AIContentAnalysisService analysisService,
            UserRepository userRepository) {

        this.analysisService = analysisService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{manuscriptId}/ai-content")
    public ResponseEntity<AIContentAnalysisResponse> analyzeAIContent(
            @PathVariable Long manuscriptId,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        AIContentAnalysisResponse response = analysisService.analyzeManuscript(
                manuscriptId,
                currentUser);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{manuscriptId}/ai-content")
    public ResponseEntity<AIContentAnalysisResponse> getLatestAnalysis(
            @PathVariable Long manuscriptId,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        AIContentAnalysisResponse response = analysisService.getLatestAnalysis(
                manuscriptId,
                currentUser);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{manuscriptId}/ai-content/history")
    public ResponseEntity<List<AIContentAnalysisResponse>> getAnalysisHistory(
            @PathVariable Long manuscriptId,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        return ResponseEntity.ok(
                analysisService.getAnalysisHistory(
                        manuscriptId,
                        currentUser));
    }

    private User getCurrentUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        /*
         * JwtAuthenticationFilter is already storing
         * the authenticated User entity as the principal.
         */
        if (principal instanceof User) {
            return (User) principal;
        }

        /*
         * Fallback for authentication configurations
         * where the principal is represented as a username/email.
         */
        String username = authentication.getName();

        User user = userRepository
                .findByEmail(username)
                .orElse(null);

        if (user != null) {
            return user;
        }

        try {
            Long userId = Long.parseLong(username);

            return userRepository
                    .findById(userId)
                    .orElseThrow(() -> new RuntimeException(
                            "Authenticated user not found"));

        } catch (NumberFormatException e) {

            throw new RuntimeException(
                    "Authenticated user not found: "
                            + username);
        }
    }
}