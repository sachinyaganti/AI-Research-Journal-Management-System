package com.researchjournal.service;

import com.researchjournal.entity.Manuscript;
import com.researchjournal.repository.ManuscriptRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ManuscriptFileService {

    private final ManuscriptRepository manuscriptRepository;

    private final Path uploadDirectory = Paths.get("uploads/manuscripts").toAbsolutePath().normalize();

    public ManuscriptFileService(
            ManuscriptRepository manuscriptRepository) {

        this.manuscriptRepository = manuscriptRepository;
    }

    public Manuscript uploadFile(
            Long manuscriptId,
            MultipartFile file) throws IOException {

        Manuscript manuscript = manuscriptRepository
                .findById(manuscriptId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Manuscript not found"));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a PDF file");
        }

        String contentType = file.getContentType();

        if (!"application/pdf".equalsIgnoreCase(contentType)) {
            throw new IllegalArgumentException(
                    "Only PDF files are allowed");
        }

        Files.createDirectories(uploadDirectory);

        String originalFileName = file.getOriginalFilename();

        String safeFileName = originalFileName == null
                ? "manuscript.pdf"
                : Paths.get(originalFileName)
                        .getFileName()
                        .toString();

        String storedFileName = UUID.randomUUID() + "_" + safeFileName;

        Path targetPath = uploadDirectory.resolve(storedFileName)
                .normalize();

        if (!targetPath.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid file path");
        }

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING);

        manuscript.setFileName(safeFileName);
        manuscript.setFilePath(targetPath.toString());
        manuscript.setFileType(contentType);
        manuscript.setFileSize(file.getSize());

        return manuscriptRepository.save(manuscript);
    }
}