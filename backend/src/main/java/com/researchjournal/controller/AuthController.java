package com.researchjournal.controller;

import com.researchjournal.dto.RegisterRequest;
import com.researchjournal.dto.UserResponse;
import com.researchjournal.entity.User;
import com.researchjournal.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.researchjournal.dto.LoginRequest;
import com.researchjournal.dto.LoginResponse;
import com.researchjournal.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.registerUser(request);

        UserResponse response = new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        User user = userService.loginUser(request);

        String token = jwtService.generateToken(user);

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive());

        LoginResponse response = new LoginResponse(
                token,
                "Bearer",
                userResponse);

        return ResponseEntity.ok(response);
    }
}