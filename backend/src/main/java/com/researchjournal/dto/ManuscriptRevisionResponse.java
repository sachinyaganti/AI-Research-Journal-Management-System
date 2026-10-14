package com.researchjournal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManuscriptRevisionResponse {

    private Long id;
    private Long manuscriptId;
    private Integer versionNumber;
    private String responseNotes;
    private String fileName;
    private Long fileSize;
    private LocalDateTime submittedAt;
}
