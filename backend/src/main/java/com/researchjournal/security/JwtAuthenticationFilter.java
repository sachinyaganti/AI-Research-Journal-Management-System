package com.researchjournal.security;

import com.researchjournal.entity.User;
import com.researchjournal.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

        private final JwtService jwtService;
        private final UserRepository userRepository;

        @Override
        protected boolean shouldNotFilterErrorDispatch() {
                return true;
        }

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain)
                        throws ServletException, IOException {

                String authorizationHeader = request.getHeader("Authorization");

                if (authorizationHeader == null
                                || !authorizationHeader.startsWith("Bearer ")) {

                        filterChain.doFilter(request, response);
                        return;
                }

                String token = authorizationHeader.substring(7);

                try {

                        String email = jwtService.extractEmail(token);

                        if (email != null
                                        && SecurityContextHolder
                                                        .getContext()
                                                        .getAuthentication() == null) {

                                Optional<User> optionalUser = userRepository.findByEmail(email);

                                if (optionalUser.isPresent()) {

                                        User user = optionalUser.get();

                                        if (jwtService.isTokenValid(token)
                                                        && user.isActive()) {

                                                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(
                                                                "ROLE_" +
                                                                                user.getRole().name());

                                                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                                                user,
                                                                null,
                                                                List.of(authority));

                                                authentication.setDetails(
                                                                new WebAuthenticationDetailsSource()
                                                                                .buildDetails(request));

                                                SecurityContextHolder
                                                                .getContext()
                                                                .setAuthentication(authentication);
                                        }
                                }
                        }

                } catch (JwtException | IllegalArgumentException exception) {

                        SecurityContextHolder.clearContext();
                }

                filterChain.doFilter(request, response);
        }
}