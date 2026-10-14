package com.researchjournal.service;

import com.researchjournal.dto.RegisterRequest;
import com.researchjournal.entity.User;
import com.researchjournal.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.researchjournal.exception.ResourceAlreadyExistsException;
import com.researchjournal.dto.LoginRequest;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User loginUser(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException(
                    "User account is inactive");
        }

        return user;
    }

    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Email already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.researchjournal.entity.Role.AUTHOR)
                .active(true)
                .build();

        return userRepository.save(user);
    }

    public java.util.List<com.researchjournal.dto.UserResponse> getReviewers() {
        return userRepository.findByRole(com.researchjournal.entity.Role.REVIEWER)
                .stream()
                .filter(User::isActive)
                .map(user -> new com.researchjournal.dto.UserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        user.isActive()))
                .toList();
    }

    public User loginOrRegisterGoogle(com.researchjournal.dto.GoogleAuthRequest request) {
        return userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseGet(() -> {
                    // Automatically register new Google user with AUTHOR role
                    User newUser = User.builder()
                            .fullName(request.getFullName())
                            .email(request.getEmail().toLowerCase().trim())
                            .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                            .role(com.researchjournal.entity.Role.AUTHOR)
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                });
    }

    public User findByEmail(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "User not found"));
    }
}