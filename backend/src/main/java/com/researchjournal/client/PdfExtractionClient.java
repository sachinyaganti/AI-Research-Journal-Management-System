package com.researchjournal.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class PdfExtractionClient {

    private final RestClient restClient;

    public PdfExtractionClient() {
        this.restClient = RestClient
                .builder()
                .baseUrl("http://localhost:8001")
                .build();
    }

    public PdfExtractionResponse extractText(
            byte[] pdfBytes,
            String fileName) {

        ByteArrayResource resource = new ByteArrayResource(pdfBytes) {

            @Override
            public String getFilename() {
                return fileName;
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        body.add("file", resource);

        return restClient
                .post()
                .uri("/api/analysis/screen-pdf")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(PdfExtractionResponse.class);
    }

    @Getter
    @Setter
    public static class PdfExtractionResponse {

        @JsonProperty("file_name")
        private String fileName;

        @JsonProperty("page_count")
        private int pageCount;

        @JsonProperty("character_count")
        private int characterCount;

        @JsonProperty("extracted_text")
        private String extractedText;
    }
}