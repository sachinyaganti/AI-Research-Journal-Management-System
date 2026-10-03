package com.researchjournal.controller;

import com.researchjournal.dto.PrePublicationScreeningResponse;
import com.researchjournal.entity.User;
import com.researchjournal.service.PrePublicationScreeningService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/manuscripts")
public class PrePublicationScreeningController {

    private final PrePublicationScreeningService screeningService;

    public PrePublicationScreeningController(
            PrePublicationScreeningService screeningService) {

        this.screeningService = screeningService;
    }

    @PostMapping("/{manuscriptId}/screen")
    public ResponseEntity<PrePublicationScreeningResponse> runScreening(
            @PathVariable Long manuscriptId,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();

        PrePublicationScreeningResponse response =
                screeningService.runScreening(
                        manuscriptId,
                        currentUser);

        return ResponseEntity.ok(response);
    }
}