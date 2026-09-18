package com.researchjournal.controller;

import com.researchjournal.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/protected")
    public ResponseEntity<Map<String, Object>> protectedEndpoint(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        Map<String, Object> response = new HashMap<>();

        response.put("message",
                "JWT authentication successful");

        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }
}