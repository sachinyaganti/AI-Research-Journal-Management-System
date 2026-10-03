package com.researchjournal.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class AIAnalysisClient {

    private final RestClient restClient;

    public AIAnalysisClient() {
        this.restClient = RestClient
                .builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    public ManuscriptAnalysisResponse analyzeManuscript(
            ManuscriptAnalysisRequest request) {

        return restClient
                .post()
                .uri("/api/analysis/manuscript")
                .body(request)
                .retrieve()
                .body(ManuscriptAnalysisResponse.class);
    }

    @Getter
    @Setter
    public static class ManuscriptAnalysisRequest {

        private String title;

        @JsonProperty("abstractText")
        private String abstractText;

        private String keywords;

        private String category;

        public ManuscriptAnalysisRequest() {
        }

        public ManuscriptAnalysisRequest(
                String title,
                String abstractText,
                String keywords,
                String category) {

            this.title = title;
            this.abstractText = abstractText;
            this.keywords = keywords;
            this.category = category;
        }
    }

    @Getter
    @Setter
    public static class ManuscriptAnalysisResponse {

        private String title;

        private String category;

        @JsonProperty("abstract_word_count")
        private int abstractWordCount;

        @JsonProperty("keyword_count")
        private int keywordCount;

        @JsonProperty("abstract_quality")
        private String abstractQuality;

        @JsonProperty("methodology_quality")
        private String methodologyQuality;

        @JsonProperty("results_quality")
        private String resultsQuality;

        @JsonProperty("conclusion_quality")
        private String conclusionQuality;

        @JsonProperty("writing_quality")
        private String writingQuality;

        private String relevance;

        @JsonProperty("missing_sections")
        private List<String> missingSections;

        @JsonProperty("writing_issues")
        private List<String> writingIssues;

        private List<String> suggestions;
    }
}