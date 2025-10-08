package com.example.Toastmasters.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AbbreviationsResponseDTO {

    private Long abbreviationId;
    private String abbreviation;
    private String meaning;

}
