package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.AbbreviationsRequestDTO;
import com.example.Toastmasters.dto.response.AbbreviationsResponseDTO;
import com.example.Toastmasters.entity.agenda.Abbreviations;
import com.example.Toastmasters.mapper.AbbreviationsMapper;
import com.example.Toastmasters.repository.AbbreviationsRepository;
import com.example.Toastmasters.service.AbbreviationsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.scanner.Constant;

import javax.management.RuntimeMBeanException;
import java.util.List;


@Service
public class AbbreviationsServiceImpl implements AbbreviationsService
{

    private final AbbreviationsRepository abbreviationsRepository;
    private final AbbreviationsMapper mapper;

    public AbbreviationsServiceImpl(AbbreviationsRepository abbreviationsRepository, AbbreviationsMapper mapper) {
        this.abbreviationsRepository = abbreviationsRepository;
        this.mapper = mapper;
    }


    @Override
    public ResponseEntity<AbbreviationsResponseDTO> addAbbreviation(AbbreviationsRequestDTO abbreviations) {
        if (abbreviations == null) {
            throw new RuntimeException("Abbreviation request data cannot be null.");
        }

        Abbreviations savedAbbreviation = abbreviationsRepository.save(mapper.toEntity(abbreviations));
        System.out.println("Abbreviation added successfully: " + savedAbbreviation.getAbbreviation());
        return ResponseEntity.ok(mapper.toDto(savedAbbreviation));
    }

    @Override
    public ResponseEntity<List<AbbreviationsResponseDTO>> getAllAbbreviations() {
        List<Abbreviations> abbreviationsList = abbreviationsRepository.findAll();

        if (abbreviationsList.isEmpty()) {
            System.out.println(" No abbreviations found.");
            return ResponseEntity.noContent().build();
        }

        List<AbbreviationsResponseDTO> responseList =
                abbreviationsList.stream().map(mapper::toDto).toList();

        System.out.println("Fetched all abbreviations successfully. Count: " + responseList.size());
        return ResponseEntity.ok(responseList);
    }

    @Override
    public ResponseEntity<AbbreviationsResponseDTO> getAbbreviationsById(Long abbreviationId) {
        return abbreviationsRepository.findById(abbreviationId)
                .map(abbreviation -> {
                    System.out.println(" Abbreviation found with ID: " + abbreviationId);
                    return ResponseEntity.ok(mapper.toDto(abbreviation));
                })
                .orElseGet(() -> {
                    System.out.println(" No abbreviation found with ID: " + abbreviationId);
                    return ResponseEntity.notFound().build();
                });
    }

    @Override
    public ResponseEntity<AbbreviationsResponseDTO> getAbbreviationsByName(String abbreviation) {
        return abbreviationsRepository.findByAbbreviation(abbreviation)
                .map(abbreviationData -> {
                    System.out.println("Abbreviation found: " + abbreviation);
                    return ResponseEntity.ok(mapper.toDto(abbreviationData));
                })
                .orElseGet(() -> {
                    System.out.println("Abbreviation not found: " + abbreviation);
                    return ResponseEntity.notFound().build();
                });
    }




    @Override
    public ResponseEntity<AbbreviationsResponseDTO> updateAbbreviationsById(AbbreviationsRequestDTO dto, Long abbreviationId) {
        if (dto == null) {
            throw new RuntimeException("Update request data cannot be null.");
        }

        return abbreviationsRepository.findById(abbreviationId)
                .map(existing -> {
                    existing.setAbbreviation(dto.getAbbreviation());
                    existing.setMeaning(dto.getMeaning());
                    Abbreviations updated = abbreviationsRepository.save(existing);
                    System.out.println("Abbreviation updated successfully for ID: " + abbreviationId);
                    return ResponseEntity.ok(mapper.toDto(updated));
                })
                .orElseGet(() -> {
                    System.out.println("Failed to update. No abbreviation found with ID: " + abbreviationId);
                    return ResponseEntity.notFound().build();
                });
    }

    @Override
    public ResponseEntity<AbbreviationsResponseDTO> deleteAbbreviationsById(Long abbreviationId) {
        return abbreviationsRepository.findById(abbreviationId)
                .map(existing -> {
                    abbreviationsRepository.delete(existing);
                    System.out.println(" Abbreviation deleted successfully with ID: " + abbreviationId);
                    return ResponseEntity.ok(mapper.toDto(existing));
                })
                .orElseGet(() -> {
                    System.out.println(" Delete failed. No abbreviation found with ID: " + abbreviationId);
                    return ResponseEntity.notFound().build();
                });
    }
}

