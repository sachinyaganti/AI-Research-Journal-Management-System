package com.researchjournal.controller;

import com.researchjournal.dto.ManuscriptRequest;
import com.researchjournal.dto.ManuscriptResponse;
import com.researchjournal.entity.ManuscriptStatus;
import com.researchjournal.entity.Role;
import com.researchjournal.entity.User;
import com.researchjournal.service.ManuscriptService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.researchjournal.client.AIAnalysisClient;
import java.util.List;

import com.researchjournal.dto.AIAnalysisResponse;
import com.researchjournal.service.AIAnalysisService;

@RestController
@RequestMapping("/api/manuscripts")
public class ManuscriptController {

        private final ManuscriptService manuscriptService;
        private final AIAnalysisService aiAnalysisService;

        public ManuscriptController(
                        ManuscriptService manuscriptService, AIAnalysisService aiAnalysisService) {

                this.manuscriptService = manuscriptService;
                this.aiAnalysisService = aiAnalysisService;
        }

        @PostMapping
        public ResponseEntity<ManuscriptResponse> createManuscript(
                        @Valid @RequestBody ManuscriptRequest request,
                        Authentication authentication) {

                User author = (User) authentication.getPrincipal();

                ManuscriptResponse response = manuscriptService.createManuscript(
                                request,
                                author);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }

        @GetMapping
        public ResponseEntity<List<ManuscriptResponse>> getMyManuscripts(
                        Authentication authentication) {

                User author = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.getMyManuscripts(author));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ManuscriptResponse> getMyManuscript(
                        @PathVariable Long id,
                        Authentication authentication) {

                User author = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.getMyManuscript(
                                                id,
                                                author));
        }

        @PutMapping("/{id}")
        public ResponseEntity<ManuscriptResponse> updateManuscript(
                        @PathVariable Long id,
                        @Valid @RequestBody ManuscriptRequest request,
                        Authentication authentication) {

                User author = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.updateManuscript(
                                                id,
                                                request,
                                                author));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteManuscript(
                        @PathVariable Long id,
                        Authentication authentication) {

                User author = (User) authentication.getPrincipal();

                manuscriptService.deleteManuscript(
                                id,
                                author);

                return ResponseEntity.noContent().build();
        }

        @PostMapping("/{id}/submit")
        public ResponseEntity<ManuscriptResponse> submitManuscript(
                        @PathVariable Long id,
                        Authentication authentication) {

                User author = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.submitManuscript(
                                                id,
                                                author));
        }

        @GetMapping("/status/{status}")
        public ResponseEntity<List<ManuscriptResponse>> getManuscriptsByStatus(
                        @PathVariable ManuscriptStatus status,
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();

                if (currentUser.getRole() != Role.EDITOR
                                && currentUser.getRole() != Role.ADMIN) {

                        throw new AccessDeniedException(
                                        "Only editors and admins can view manuscripts by status");
                }

                return ResponseEntity.ok(
                                manuscriptService.getManuscriptsByStatus(status));
        }

        @PostMapping("/{id}/move-to-review")
        public ResponseEntity<ManuscriptResponse> moveToUnderReview(
                        @PathVariable Long id,
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.moveToUnderReview(
                                                id,
                                                currentUser));
        }

        @PostMapping("/{id}/analyze")
        public ResponseEntity<AIAnalysisClient.ManuscriptAnalysisResponse> analyzeManuscript(
                        @PathVariable Long id,
                        Authentication authentication) {

                User author = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.analyzeManuscript(
                                                id,
                                                author));
        }

        @GetMapping("/{id}/analysis")
        public ResponseEntity<AIAnalysisResponse> getLatestAnalysis(
                        @PathVariable Long id,
                        Authentication authentication) {

                User author = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                aiAnalysisService.getLatestAnalysis(
                                                id,
                                                author));
        }
}