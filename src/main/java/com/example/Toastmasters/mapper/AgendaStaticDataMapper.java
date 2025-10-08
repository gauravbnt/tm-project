package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.AgendaStaticDataRequestDTO;
import com.example.Toastmasters.dto.response.AgendaResponseDTO;
import com.example.Toastmasters.dto.response.AgendaStaticDataResponseDTO;
import com.example.Toastmasters.entity.agenda.AgendaStaticData;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AgendaStaticDataMapper {

    AgendaStaticData toEntity(AgendaStaticDataRequestDTO agendaRequestDTO);

    AgendaStaticDataResponseDTO toDto(AgendaStaticData agendaStaticData);
}
