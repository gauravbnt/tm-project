package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.AgendaRequestDTO;
import com.example.Toastmasters.dto.response.AgendaResponseDTO;
import com.example.Toastmasters.entity.Agenda;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AgendaMapper {
    Agenda toEntity(AgendaRequestDTO agendaRequestDTO);
    AgendaResponseDTO toDto(Agenda agenda);
}
