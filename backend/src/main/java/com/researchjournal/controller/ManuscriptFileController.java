package com.researchjournal.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.researchjournal.entity.Manuscript;
import com.researchjournal.entity.User;
import com.researchjournal.repository.ManuscriptRepository;
import com.researchjournal.service.ManuscriptFileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/manuscripts")
public class ManuscriptFileController {

        private final ManuscriptFileService manuscriptFileService;
        private final ManuscriptRepository manuscriptRepository;
        private final com.researchjournal.repository.ReviewerAssignmentRepository reviewerAssignmentRepository;

        public ManuscriptFileController(
                        ManuscriptFileService manuscriptFileService,
                        ManuscriptRepository manuscriptRepository,
                        com.researchjournal.repository.ReviewerAssignmentRepository reviewerAssignmentRepository) {

                this.manuscriptFileService = manuscriptFileService;
                this.manuscriptRepository = manuscriptRepository;
                this.reviewerAssignmentRepository = reviewerAssignmentRepository;
        }

        @PostMapping("/{manuscriptId}/file")
        public ResponseEntity<Map<String, Object>> uploadFile(
                        @PathVariable Long manuscriptId,
                        @RequestParam("file") MultipartFile file,
                        Authentication authentication) throws IOException {

                User currentUser = (User) authentication.getPrincipal();

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Manuscript not found"));

                if (!manuscript.getAuthor()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new AccessDeniedException(
                                        "You are not authorized to upload a file for this manuscript");
                }

                Manuscript updatedManuscript = manuscriptFileService.uploadFile(
                                manuscriptId,
                                file);

                Map<String, Object> response = new HashMap<>();

                response.put(
                                "message",
                                "Manuscript PDF uploaded successfully");

                response.put(
                                "manuscriptId",
                                updatedManuscript.getId());

                response.put(
                                "fileName",
                                updatedManuscript.getFileName());

                response.put(
                                "fileType",
                                updatedManuscript.getFileType());

                response.put(
                                "fileSize",
                                updatedManuscript.getFileSize());

                return ResponseEntity.ok(response);
        }

        @GetMapping("/{manuscriptId}/file")
        public ResponseEntity<Resource> downloadFile(
                        @PathVariable Long manuscriptId,
                        Authentication authentication) throws IOException {

                User currentUser = authentication != null ? (User) authentication.getPrincipal() : null;

                Manuscript manuscript = manuscriptRepository
                                .findById(manuscriptId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Manuscript not found"));

                boolean isAuthor = currentUser != null && manuscript.getAuthor().getId().equals(currentUser.getId());
                boolean isEditorOrAdmin = currentUser != null && (
                                currentUser.getRole() == com.researchjournal.entity.Role.EDITOR
                                || currentUser.getRole() == com.researchjournal.entity.Role.ADMIN);
                boolean isAssignedReviewer = currentUser != null && reviewerAssignmentRepository.existsByManuscriptAndReviewer(manuscript, currentUser);
                boolean isPublished = manuscript.getStatus() == com.researchjournal.entity.ManuscriptStatus.PUBLISHED;

                if (!isAuthor && !isEditorOrAdmin && !isAssignedReviewer && !isPublished) {
                        throw new AccessDeniedException(
                                        "You are not authorized to access this manuscript file");
                }

                if (manuscript.getFilePath() == null) {
                        throw new IllegalArgumentException(
                                        "No file uploaded for this manuscript");
                }

                Path filePath = Paths.get(manuscript.getFilePath())
                                .toAbsolutePath()
                                .normalize();

                if (!Files.exists(filePath)) {
                        throw new IllegalArgumentException(
                                        "Manuscript file not found");
                }

                byte[] fileBytes = Files.readAllBytes(filePath);

                ByteArrayResource resource = new ByteArrayResource(fileBytes);

                return ResponseEntity.ok()
                                .contentType(MediaType.APPLICATION_PDF)
                                .header(
                                                HttpHeaders.CONTENT_DISPOSITION,
                                                "inline; filename=\"" +
                                                                manuscript.getFileName() +
                                                                "\"")
                                .contentLength(fileBytes.length)
                                .body(resource);
        }
}