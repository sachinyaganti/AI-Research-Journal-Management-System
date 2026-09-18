package com.researchjournal.exception;

import com.researchjournal.dto.ErrorResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ErrorResponse> handleIllegalStateException(
                        IllegalStateException exception) {

                ErrorResponse errorResponse = new ErrorResponse(
                                LocalDateTime.now(),
                                HttpStatus.CONFLICT.value(),
                                "Conflict",
                                exception.getMessage());

                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(errorResponse);
        }

        @ExceptionHandler(ResourceAlreadyExistsException.class)
        public ResponseEntity<ErrorResponse> handleResourceAlreadyExists(
                        ResourceAlreadyExistsException ex) {

                ErrorResponse errorResponse = new ErrorResponse(
                                LocalDateTime.now(),
                                HttpStatus.CONFLICT.value(),
                                "Conflict",
                                ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(errorResponse);
        }
}