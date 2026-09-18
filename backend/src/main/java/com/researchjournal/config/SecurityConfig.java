package com.researchjournal.config;

import com.researchjournal.repository.UserRepository;
import com.researchjournal.security.JwtAuthenticationFilter;
import com.researchjournal.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtService jwtService;
        private final UserRepository userRepository;

        @Bean
        public JwtAuthenticationFilter jwtAuthenticationFilter() {
                return new JwtAuthenticationFilter(
                                jwtService,
                                userRepository);
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(
                                List.of("http://localhost:5173"));

                configuration.setAllowedMethods(
                                List.of(
                                                HttpMethod.GET.name(),
                                                HttpMethod.POST.name(),
                                                HttpMethod.PUT.name(),
                                                HttpMethod.DELETE.name(),
                                                HttpMethod.OPTIONS.name()));

                configuration.setAllowedHeaders(
                                List.of("*"));

                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        JwtAuthenticationFilter jwtAuthenticationFilter)
                        throws Exception {

                http
                                .csrf(csrf -> csrf.disable())

                                .cors(cors -> cors.configurationSource(
                                                corsConfigurationSource()))

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .exceptionHandling(exception -> exception.authenticationEntryPoint(
                                                new HttpStatusEntryPoint(
                                                                HttpStatus.UNAUTHORIZED)))

                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/api/health",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.OPTIONS,
                                                                "/**")
                                                .permitAll()

                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}