package com.researchjournal.service;

import com.researchjournal.dto.GoogleAuthRequest;
import com.researchjournal.dto.LoginRequest;
import com.researchjournal.dto.RegisterRequest;
import com.researchjournal.entity.Role;
import com.researchjournal.entity.User;
import com.researchjournal.exception.ResourceAlreadyExistsException;
import com.researchjournal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void registerUser_AlwaysForcesAuthorRole() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("author@example.com");
        request.setFullName("Dr. Author");
        request.setPassword("password123");

        when(userRepository.existsByEmail("author@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registered = userService.registerUser(request);

        assertNotNull(registered);
        assertEquals(Role.AUTHOR, registered.getRole());
        assertEquals("author@example.com", registered.getEmail());
        assertTrue(registered.isActive());
        verify(userRepository).save(argThat(user -> user.getRole() == Role.AUTHOR));
    }

    @Test
    void registerUser_DuplicateEmailThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setFullName("Existing User");
        request.setPassword("password123");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> userService.registerUser(request));
    }

    @Test
    void loginUser_ValidCredentialsSuccess() {
        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .password("encodedPassword")
                .role(Role.AUTHOR)
                .active(true)
                .build();

        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("plainPassword");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("plainPassword", "encodedPassword")).thenReturn(true);

        User loggedIn = userService.loginUser(request);

        assertEquals(user.getId(), loggedIn.getId());
    }

    @Test
    void loginUser_InvalidPasswordThrowsException() {
        User user = User.builder()
                .id(1L)
                .email("user@example.com")
                .password("encodedPassword")
                .role(Role.AUTHOR)
                .active(true)
                .build();

        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrongPassword");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> userService.loginUser(request));
    }

    @Test
    void loginOrRegisterGoogle_CreatesAuthorIfNew() {
        GoogleAuthRequest request = new GoogleAuthRequest("google.user@example.com", "Google Scholar", null);

        when(userRepository.findByEmail("google.user@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashedRandomPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = userService.loginOrRegisterGoogle(request);

        assertNotNull(user);
        assertEquals(Role.AUTHOR, user.getRole());
        assertEquals("google.user@example.com", user.getEmail());
    }
}
