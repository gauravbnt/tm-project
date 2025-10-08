package com.example.Toastmasters.service;

import com.example.Toastmasters.dto.request.AgendaRequestDTO;
import com.example.Toastmasters.dto.response.AgendaResponseDTO;
import org.springframework.http.ResponseEntity;
import java.util.List;

public interface AgendaService {

    ResponseEntity<List<AgendaResponseDTO>> addAgendaRows(List<AgendaRequestDTO> agendaRows);

    ResponseEntity<List<AgendaResponseDTO>> getAllAgendaRows();

    ResponseEntity<List<AgendaResponseDTO>> getAgendaRowsByMeeting(Long meetingId);

   // ResponseEntity<List<AgendaResponseDTO>> copyAgendaByMeeting(long fromMeetingId, long toMeetingId);
}
