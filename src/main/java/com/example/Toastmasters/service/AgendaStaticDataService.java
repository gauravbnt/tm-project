package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.AgendaStaticDataRequestDTO;
import com.example.Toastmasters.dto.response.AgendaStaticDataResponseDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface AgendaStaticDataService {
    ResponseEntity<AgendaStaticDataResponseDTO> addStaticData(AgendaStaticDataRequestDTO agendaStaticDataRequestDTO);

    ResponseEntity<List<AgendaStaticDataResponseDTO>> getAllStaticData();

    ResponseEntity<AgendaStaticDataResponseDTO> getAllStaticDataByInfoKeyOrInfoValue(String keyOrValue);

    ResponseEntity<AgendaStaticDataResponseDTO> updateStaticDataById(AgendaStaticDataRequestDTO agendaStaticDataRequestDTO, Long infoId);

    ResponseEntity<AgendaStaticDataResponseDTO>deleteStaticDataById(Long infoId);

}
