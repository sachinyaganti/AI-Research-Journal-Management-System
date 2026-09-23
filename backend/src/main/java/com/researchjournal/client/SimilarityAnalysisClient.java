package com.researchjournal.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class SimilarityAnalysisClient {

    private final RestClient restClient;

    public SimilarityAnalysisClient() {
        this.restClient = RestClient
                .builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    public SimilarityAnalysisResponse analyzeSimilarity(
            SimilarityAnalysisRequest request) {

        return restClient
                .post()
                .uri("/api/analysis/similarity")
                .body(request)
                .retrieve()
                .body(SimilarityAnalysisResponse.class);
    }

    @Getter
    @Setter
    public static class SimilarityAnalysisRequest {

        @JsonProperty("manuscript_id")
        private Long manuscriptId;

        private String title;

        @JsonProperty("abstractText")
        private String abstractText;

        private List<SimilarityCandidate> candidates;

        public SimilarityAnalysisRequest() {
        }

        public SimilarityAnalysisRequest(
                Long manuscriptId,
                String title,
                String abstractText,
                List<SimilarityCandidate> candidates) {

            this.manuscriptId = manuscriptId;
            this.title = title;
            this.abstractText = abstractText;
            this.candidates = candidates;
        }
    }

    @Getter
    @Setter
    public static class SimilarityCandidate {

        @JsonProperty("manuscript_id")
        private Long manuscriptId;

        private String title;

        @JsonProperty("abstractText")
        private String abstractText;

        public SimilarityCandidate() {
        }

        public SimilarityCandidate(
                Long manuscriptId,
                String title,
                String abstractText) {

            this.manuscriptId = manuscriptId;
            this.title = title;
            this.abstractText = abstractText;
        }
    }

    @Getter
    @Setter
    public static class SimilarityAnalysisResponse {

        @JsonProperty("manuscript_id")
        private Long manuscriptId;

        @JsonProperty("similarity_percentage")
        private double similarityPercentage;

        private String status;

        private List<SimilarityMatch> matches;
    }

    @Getter
    @Setter
    public static class SimilarityMatch {

        @JsonProperty("manuscript_id")
        private Long manuscriptId;

        private String title;

        @JsonProperty("similarity_percentage")
        private double similarityPercentage;
    }
}