package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.request.ClubOfficersRequestDTO;
import com.example.Toastmasters.dto.response.ClubOfficersResponseDTO;

import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.entity.agenda.ClubOfficers;
import com.example.Toastmasters.exception.MemberNotFoundException;
import com.example.Toastmasters.mapper.ClubOfficersMapper;
import com.example.Toastmasters.repository.AddMemberRepository;
import com.example.Toastmasters.repository.ClubOfficersRepository;
import com.example.Toastmasters.service.ClubOfficersService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClubOfficersServiceImpl implements ClubOfficersService {

    private final ClubOfficersRepository clubOfficersRepository;
    private final ClubOfficersMapper mapper;
    private final AddMemberRepository userRepository;

    public ClubOfficersServiceImpl(
            ClubOfficersRepository clubOfficersRepository,
            ClubOfficersMapper mapper,
            AddMemberRepository userRepository
    ) {
        this.clubOfficersRepository = clubOfficersRepository;
        this.mapper = mapper;
        this.userRepository = userRepository;
    }

    @Override
    public ResponseEntity<ClubOfficersResponseDTO> addClubOfficer(ClubOfficersRequestDTO clubOfficersRequestDTO) {
        if (clubOfficersRequestDTO == null)
            throw new RuntimeException("Club officer request cannot be null.");

        Optional<AddMember> addMember = userRepository.findById(clubOfficersRequestDTO.getMemberId());
        if (addMember.isEmpty())
            throw new MemberNotFoundException("Member not found for given user ID.");

        AddMember member = addMember.get();

        ClubOfficers clubOfficers = new ClubOfficers();
        clubOfficers.setAddMember(member);
        clubOfficers.setLeadershipName(clubOfficersRequestDTO.getLeadershipName());

        ClubOfficers savedOfficer = clubOfficersRepository.save(clubOfficers);
        System.out.println(" Club officer added successfully: " + savedOfficer.getLeadershipName());

        return ResponseEntity.ok(mapper.toDto(savedOfficer));
    }

    @Override
    public ResponseEntity<List<ClubOfficersResponseDTO>> getAllClubOfficer() {
        List<ClubOfficers> officersList = clubOfficersRepository.findAll();

        if (officersList.isEmpty()) {
            System.out.println("No club officers found.");
            return ResponseEntity.noContent().build();
        }

        List<ClubOfficersResponseDTO> dtoList = officersList.stream()
                .map(mapper::toDto)
                .toList();

        System.out.println(" Retrieved all club officers. Count: " + dtoList.size());
        return ResponseEntity.ok(dtoList);
    }

    @Override
    public ResponseEntity<ClubOfficersResponseDTO> updateClubOfficerById(ClubOfficersRequestDTO clubOfficersRequestDTO, Long officerId) {
        if (clubOfficersRequestDTO == null)
            throw new RuntimeException("Update request cannot be null.");

        Optional<ClubOfficers> existingOfficer = clubOfficersRepository.findById(officerId);
        if (existingOfficer.isEmpty()) {
            System.out.println(" Update failed. No club officer found with ID: " + officerId);
            return ResponseEntity.notFound().build();
        }

        ClubOfficers existing = existingOfficer.get();
        existing.setLeadershipName(clubOfficersRequestDTO.getLeadershipName());
        existing.setAddMember(mapper.memberFromId(clubOfficersRequestDTO.getMemberId()));

        ClubOfficers updated = clubOfficersRepository.save(existing);
        System.out.println("Club officer updated successfully for ID: " + officerId);

        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @Override
    public ResponseEntity<ClubOfficersResponseDTO> deleteClubOfficerById(Long officerId) {
        Optional<ClubOfficers> existingOfficer = clubOfficersRepository.findById(officerId);
        if (existingOfficer.isEmpty()) {
            System.out.println(" Delete failed. No club officer found with ID: " + officerId);
            return ResponseEntity.notFound().build();
        }

        clubOfficersRepository.delete(existingOfficer.get());
        System.out.println(" Club officer deleted successfully with ID: " + officerId);

        return ResponseEntity.ok(mapper.toDto(existingOfficer.get()));
    }
}
