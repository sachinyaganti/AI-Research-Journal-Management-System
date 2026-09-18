package com.researchjournal.dto;

import com.researchjournal.entity.ReviewRecommendation;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReviewResponse {

    private Long id;

    private Long assignmentId;

    private Long manuscriptId;

    private String manuscriptTitle;

    private Long reviewerId;

    private String reviewerName;

    private Integer rating;

    private String comments;

    private ReviewRecommendation recommendation;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}