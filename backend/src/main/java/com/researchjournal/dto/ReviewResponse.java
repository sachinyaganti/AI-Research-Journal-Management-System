package com.researchjournal.dto;

import com.researchjournal.entity.ReviewRecommendation;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;

    private Long assignmentId;

    private Long manuscriptId;

    private String manuscriptTitle;

    private Long reviewerId;

    private String reviewerName;

    private Integer rating;

    private String comments;

    private String commentsToAuthor;

    private String confidentialCommentsToEditor;

    private Integer clarityRating;

    private Integer originalityRating;

    private Integer methodologyRating;

    private ReviewRecommendation recommendation;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}