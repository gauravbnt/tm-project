package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.AbbreviationsRequestDTO;
import com.example.Toastmasters.dto.response.AbbreviationsResponseDTO;
import com.example.Toastmasters.entity.agenda.Abbreviations;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AbbreviationsMapper {

    Abbreviations toEntity(AbbreviationsRequestDTO abbreviationsRequestDTO);

    AbbreviationsResponseDTO toDto(Abbreviations abbreviations);


}
