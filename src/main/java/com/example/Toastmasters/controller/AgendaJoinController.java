package com.example.Toastmasters.controller;


import com.example.Toastmasters.dto.response.AgendaJoinDTO;
import com.example.Toastmasters.dto.response.MeetingResponseDTO;
import com.example.Toastmasters.service.AgendaJoinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/agenda-join")
public class AgendaJoinController {

    private final AgendaJoinService agendaJoinService;

    public AgendaJoinController(AgendaJoinService agendaJoinService) {
        this.agendaJoinService = agendaJoinService;
    }

    @GetMapping("/getAgenda/{meetingId}")
    public ResponseEntity<AgendaJoinDTO> getAgenda(@PathVariable Long meetingId){
        return agendaJoinService.getAgenda(meetingId);
    }

    @PostMapping("/isAgendaPublished/{meetingId}/{status}")
    public ResponseEntity<MeetingResponseDTO> isAgendaPublished(
            @PathVariable Long meetingId, @PathVariable String status){
        return agendaJoinService.isAgendaPublished(meetingId, status);
    }
}