package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.ClubOfficersRequestDTO;
import com.example.Toastmasters.dto.response.ClubOfficersResponseDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ClubOfficersService {
    ResponseEntity<ClubOfficersResponseDTO> addClubOfficer(ClubOfficersRequestDTO clubOfficersRequestDTO);

    ResponseEntity<List<ClubOfficersResponseDTO>> getAllClubOfficer();

    ResponseEntity<ClubOfficersResponseDTO> updateClubOfficerById(ClubOfficersRequestDTO clubOfficersRequestDTO, Long officerId);

    ResponseEntity<ClubOfficersResponseDTO> deleteClubOfficerById(Long officerId);
}
