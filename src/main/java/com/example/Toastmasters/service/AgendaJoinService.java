package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.response.AgendaJoinDTO;
import com.example.Toastmasters.dto.response.MeetingResponseDTO;
import org.springframework.http.ResponseEntity;

public interface AgendaJoinService {
    ResponseEntity<AgendaJoinDTO> getAgenda(Long meetingId);

    ResponseEntity<MeetingResponseDTO> isAgendaPublished(Long meetingId, String status);

}
