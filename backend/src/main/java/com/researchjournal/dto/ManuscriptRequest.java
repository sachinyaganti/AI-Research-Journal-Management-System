package com.researchjournal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ManuscriptRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title cannot exceed 500 characters")
    private String title;

    @NotBlank(message = "Abstract is required")
    private String abstractText;

    @Size(max = 1000, message = "Keywords cannot exceed 1000 characters")
    private String keywords;

    @Size(max = 255, message = "Category cannot exceed 255 characters")
    private String category;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAbstractText() {
        return abstractText;
    }

    public void setAbstractText(String abstractText) {
        this.abstractText = abstractText;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}