package com.example.Toastmasters.controller;


import com.example.Toastmasters.dto.request.AgendaRequestDTO;
import com.example.Toastmasters.dto.response.AgendaResponseDTO;
import com.example.Toastmasters.service.AgendaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/agenda")
public class AgendaController {
    private final AgendaService agendaService;

    public AgendaController(AgendaService agendaService) {
        this.agendaService = agendaService;
    }

    @PostMapping("/add")
    public ResponseEntity<List<AgendaResponseDTO>> addAgendaRows(@RequestBody List<AgendaRequestDTO> agendaRows){

        return agendaService.addAgendaRows(agendaRows);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<AgendaResponseDTO>> getAllAgendaRows()
    {
        return agendaService.getAllAgendaRows();
    }

    @GetMapping("/getAgendaRowsByMeetingId/{meetingId}")
    public ResponseEntity<List<AgendaResponseDTO>> getAgendaRowsByMeeting(@PathVariable Long meetingId){
        return agendaService.getAgendaRowsByMeeting(meetingId);
    }

    /*@PostMapping("/copyAgendaByMeeting/{fromMeetingId}/{toMeetingId}")
    public ResponseEntity<ResponseMessage<List<AgendaResponseDTO>>> copyAgendaByMeeting(
            @PathVariable int fromMeetingId, @PathVariable int toMeetingId){
        return agendaService.copyAgendaByMeeting(fromMeetingId, toMeetingId);
    }*/
}
