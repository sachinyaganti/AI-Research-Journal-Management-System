package com.researchjournal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class AIAnalysisResponse {

    private Long id;

    private Long manuscriptId;

    private String manuscriptTitle;

    private String abstractQuality;

    private String methodologyQuality;

    private String resultsQuality;

    private String conclusionQuality;

    private String writingQuality;

    private String relevance;

    private Integer abstractWordCount;

    private Integer keywordCount;

    private List<String> missingSections;

    private List<String> writingIssues;

    private List<String> suggestions;

    private LocalDateTime analyzedAt;
}