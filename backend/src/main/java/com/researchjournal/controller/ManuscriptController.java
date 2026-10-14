package com.researchjournal.controller;

import com.researchjournal.client.AIAnalysisClient;
import com.researchjournal.dto.AIAnalysisResponse;
import com.researchjournal.dto.ManuscriptRequest;
import com.researchjournal.dto.ManuscriptResponse;
import com.researchjournal.dto.ManuscriptRevisionResponse;
import com.researchjournal.dto.PublicationRequest;
import com.researchjournal.entity.ManuscriptStatus;
import com.researchjournal.entity.Role;
import com.researchjournal.entity.User;
import com.researchjournal.service.AIAnalysisService;
import com.researchjournal.service.ManuscriptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/manuscripts")
public class ManuscriptController {

        private final ManuscriptService manuscriptService;
        private final AIAnalysisService aiAnalysisService;

        public ManuscriptController(
                        ManuscriptService manuscriptService,
                        AIAnalysisService aiAnalysisService) {

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

        @GetMapping("/published")
        public ResponseEntity<List<ManuscriptResponse>> getPublishedManuscripts() {
                return ResponseEntity.ok(
                                manuscriptService.getPublishedManuscripts());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ManuscriptResponse> getMyManuscript(
                        @PathVariable Long id,
                        Authentication authentication) {

                User currentUser = authentication != null ? (User) authentication.getPrincipal() : null;

                return ResponseEntity.ok(
                                manuscriptService.getMyManuscript(
                                                id,
                                                currentUser));
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

        @PostMapping("/{id}/revisions")
        public ResponseEntity<ManuscriptResponse> submitRevision(
                        @PathVariable Long id,
                        @RequestParam("file") MultipartFile file,
                        @RequestParam(value = "responseNotes", required = false) String responseNotes,
                        Authentication authentication) throws IOException {

                User author = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.submitRevision(
                                                id,
                                                responseNotes,
                                                file,
                                                author));
        }

        @GetMapping("/{id}/revisions")
        public ResponseEntity<List<ManuscriptRevisionResponse>> getRevisions(
                        @PathVariable Long id,
                        Authentication authentication) {

                User currentUser = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.getRevisions(
                                                id,
                                                currentUser));
        }

        @PostMapping("/{id}/publish")
        public ResponseEntity<ManuscriptResponse> publishManuscript(
                        @PathVariable Long id,
                        @RequestBody PublicationRequest request,
                        Authentication authentication) {

                User editor = (User) authentication.getPrincipal();

                return ResponseEntity.ok(
                                manuscriptService.publishManuscript(
                                                id,
                                                request,
                                                editor));
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