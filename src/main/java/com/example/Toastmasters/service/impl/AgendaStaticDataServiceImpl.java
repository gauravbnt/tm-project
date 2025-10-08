package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.AgendaStaticDataRequestDTO;
import com.example.Toastmasters.dto.response.AgendaStaticDataResponseDTO;

import com.example.Toastmasters.entity.agenda.AgendaStaticData;
import com.example.Toastmasters.mapper.AgendaStaticDataMapper;
import com.example.Toastmasters.repository.AgendaStaticDataRepository;
import com.example.Toastmasters.service.AgendaStaticDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendaStaticDataServiceImpl implements AgendaStaticDataService {

    private final AgendaStaticDataRepository agendaStaticDataRepository;
    private final AgendaStaticDataMapper agendaStaticDataMapper;

    public AgendaStaticDataServiceImpl(
            AgendaStaticDataRepository agendaStaticDataRepository,
            AgendaStaticDataMapper agendaStaticDataMapper
    ) {
        this.agendaStaticDataRepository = agendaStaticDataRepository;
        this.agendaStaticDataMapper = agendaStaticDataMapper;
    }

    @Override
    public ResponseEntity<AgendaStaticDataResponseDTO> addStaticData(AgendaStaticDataRequestDTO agendaStaticDataRequestDTO) {
        if (agendaStaticDataRequestDTO == null) {
            throw new RuntimeException("Object is null....");
        }

        AgendaStaticData staticData = agendaStaticDataRepository.save(
                agendaStaticDataMapper.toEntity(agendaStaticDataRequestDTO)
        );
        AgendaStaticDataResponseDTO responseDTO = agendaStaticDataMapper.toDto(staticData);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @Override
    public ResponseEntity<List<AgendaStaticDataResponseDTO>> getAllStaticData() {
        List<AgendaStaticData> staticDataList = agendaStaticDataRepository.findAll();

        if (staticDataList.isEmpty()) {
            throw new RuntimeException("List is empty....");
        }

        List<AgendaStaticDataResponseDTO> responseDTOList =
                staticDataList.stream().map(agendaStaticDataMapper::toDto).collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(responseDTOList);
    }

    @Override
    public ResponseEntity<AgendaStaticDataResponseDTO> getAllStaticDataByInfoKeyOrInfoValue(String keyOrValue) {
        Optional<AgendaStaticData> staticData =
                agendaStaticDataRepository.findByInfoKeyOrInfoValue(keyOrValue, keyOrValue);

        if (staticData.isEmpty()) {
            throw new RuntimeException("List is empty....");
        }

        AgendaStaticDataResponseDTO responseDTO = agendaStaticDataMapper.toDto(staticData.get());

        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }

    @Override
    public ResponseEntity<AgendaStaticDataResponseDTO> updateStaticDataById(
            AgendaStaticDataRequestDTO agendaStaticInfoRequestDTO, Long infoId) {

        Optional<AgendaStaticData> existing = agendaStaticDataRepository.findById(infoId);

        if (existing.isEmpty()) {
            throw new RuntimeException("List is empty....");

        }

        AgendaStaticData staticInfo = existing.get();
        staticInfo.setInfoKey(agendaStaticInfoRequestDTO.getInfoKey());
        staticInfo.setInfoValue(agendaStaticInfoRequestDTO.getInfoValue());

        AgendaStaticData updated = agendaStaticDataRepository.save(staticInfo);
        AgendaStaticDataResponseDTO responseDTO = agendaStaticDataMapper.toDto(updated);

        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }

    @Override
    public ResponseEntity<AgendaStaticDataResponseDTO> deleteStaticDataById(Long infoId) {
        Optional<AgendaStaticData> staticInfo = agendaStaticDataRepository.findById(infoId);

        if (staticInfo.isEmpty())
            throw new RuntimeException("List is empty....");

        agendaStaticDataRepository.deleteById(infoId);
        AgendaStaticDataResponseDTO responseDTO = agendaStaticDataMapper.toDto(staticInfo.get());

        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }
}
