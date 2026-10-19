
package com.researchjournal.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class AIContentAnalysisClient {

    private final RestClient restClient;

    public AIContentAnalysisClient(
            @Value("${ai.service.base-url:http://localhost:8000}") String aiServiceBaseUrl) {

        this.restClient = RestClient
                .builder()
                .baseUrl(aiServiceBaseUrl)
                .build();
    }

    public AIContentResponse analyzeContent(String extractedText) {

        AIContentRequest request = new AIContentRequest(extractedText);

        return restClient
                .post()
                .uri("/api/analysis/ai-content")
                .body(request)
                .retrieve()
                .body(AIContentResponse.class);
    }

    @Getter
    @Setter
    public static class AIContentRequest {

        private String text;

        public AIContentRequest() {
        }

        public AIContentRequest(String text) {
            this.text = text;
        }
    }

    @Getter
    @Setter
    public static class AIContentResponse {

        @JsonProperty("ai_content_indicator")
        private double aiContentIndicator;

        @JsonProperty("human_writing_indicator")
        private double humanWritingIndicator;

        private String confidence;

        private List<String> signals;

        private String explanation;
    }
}
