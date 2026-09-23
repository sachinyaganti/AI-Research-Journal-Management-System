package com.researchjournal.controller;

import com.researchjournal.client.SimilarityAnalysisClient;
import com.researchjournal.dto.SimilarityAnalysisResponse;
import com.researchjournal.entity.User;
import com.researchjournal.service.SimilarityAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/manuscripts")
public class SimilarityAnalysisController {

    private final SimilarityAnalysisService similarityAnalysisService;

    public SimilarityAnalysisController(
            SimilarityAnalysisService similarityAnalysisService) {

        this.similarityAnalysisService = similarityAnalysisService;
    }

    @PostMapping("/{manuscriptId}/similarity")
    public ResponseEntity<SimilarityAnalysisClient.SimilarityAnalysisResponse> analyzeSimilarity(
            @PathVariable Long manuscriptId,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        SimilarityAnalysisClient.SimilarityAnalysisResponse response = similarityAnalysisService.analyzeSimilarity(
                manuscriptId,
                currentUser);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{manuscriptId}/similarity")
    public ResponseEntity<SimilarityAnalysisResponse> getLatestSimilarity(
            @PathVariable Long manuscriptId,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        SimilarityAnalysisResponse response = similarityAnalysisService.getLatestSimilarity(
                manuscriptId,
                currentUser);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }
}