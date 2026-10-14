package com.researchjournal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicationRequest {

    private String volume;

    private String issue;

    private String doi;

    private String publicationNotes;
}
