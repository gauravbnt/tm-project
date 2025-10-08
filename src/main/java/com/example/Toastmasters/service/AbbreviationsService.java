package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.AbbreviationsRequestDTO;
import com.example.Toastmasters.dto.response.AbbreviationsResponseDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AbbreviationsService {
    ResponseEntity<AbbreviationsResponseDTO> addAbbreviation(AbbreviationsRequestDTO abbreviations);

    ResponseEntity<List<AbbreviationsResponseDTO>> getAllAbbreviations();

    ResponseEntity<AbbreviationsResponseDTO> getAbbreviationsByName(String abbreviation);

    ResponseEntity<AbbreviationsResponseDTO> getAbbreviationsById(Long abbreviationId);

    ResponseEntity<AbbreviationsResponseDTO> updateAbbreviationsById(AbbreviationsRequestDTO dto, Long abbreviationId);

    ResponseEntity<AbbreviationsResponseDTO> deleteAbbreviationsById(Long abbreviationId);

}
