package com.example.Toastmasters.service.impl;


import com.example.Toastmasters.dto.request.AgendaRequestDTO;
import com.example.Toastmasters.dto.response.AgendaResponseDTO;
import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.entity.Agenda;
import com.example.Toastmasters.entity.Meeting;
import com.example.Toastmasters.mapper.AgendaMapper;
import com.example.Toastmasters.repository.AddMemberRepository;
import com.example.Toastmasters.repository.AgendaRepository;
import com.example.Toastmasters.repository.MeetingRepository;
import com.example.Toastmasters.service.AgendaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendaServiceImpl implements AgendaService {

    private final AgendaRepository agendaRepository;
    private final MeetingRepository meetingRepository;
    private final AgendaMapper mapper;
    private final AddMemberRepository addMemberRepository;

    public AgendaServiceImpl(AgendaRepository agendaRepository, MeetingRepository meetingRepository,
                             AgendaMapper mapper, AddMemberRepository addMemberRepository) {
        this.agendaRepository = agendaRepository;
        this.meetingRepository = meetingRepository;
        this.mapper = mapper;
        this.addMemberRepository = addMemberRepository;
    }


    @Override
    public ResponseEntity<List<AgendaResponseDTO>> addAgendaRows(List<AgendaRequestDTO> agendaRows) {
        // get meeting
        Long meetingId = agendaRows.getFirst().getMeetingId();
        Long memberId=agendaRows.getFirst().getMemberId();


        // clear existing agendas
        agendaRepository.deleteALLByMeetingId(meetingId);

        // map request DTOs to entities and set relations
        List<Agenda> agendaList = agendaRows.stream()
                .map(dto -> {
                    Agenda agenda = mapper.toEntity(dto);


                    agenda.setMeetingId(meetingId);
                    agenda.setMemberId(memberId);
                    return agenda;
                })
                .toList();

        // save new agendas
        List<Agenda> savedAgendas = agendaRepository.saveAll(agendaList);

        return ResponseEntity.status(HttpStatus.OK)
                .body(savedAgendas.stream().map(mapper::toDto).collect(Collectors.toList()));
    }


    @Override
    public ResponseEntity<List<AgendaResponseDTO>> getAllAgendaRows() {
        List<Agenda> agendaList = agendaRepository.findAll();
        if (agendaList == null || agendaList.isEmpty()) {
            throw new RuntimeException("List is empty...");
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(agendaList.stream().map(mapper::toDto).collect(Collectors.toList()));
    }

    @Override
    public ResponseEntity<List<AgendaResponseDTO>> getAgendaRowsByMeeting(Long meetingId) {
        List<Agenda> meetingList = agendaRepository.findAllByMeetingId(meetingId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(meetingList.stream().map(mapper::toDto).collect(Collectors.toList()));
    }

    /*@Override
    public ResponseEntity<List<AgendaResponseDTO>> copyAgendaByMeeting(long fromMeetingId, long toMeetingId) {
        Optional<Meeting> fromMeeting = meetingRepository.findById(fromMeetingId);
        if (fromMeeting.isEmpty()) {
            throw new RuntimeException("Meeting not found....");
        }

        Optional<Meeting> toMeeting = meetingRepository.findById(toMeetingId);
        if (toMeeting.isEmpty()) {
            throw new RuntimeException("Meeting not found....");
        }

        Meeting fromMeetingData = fromMeeting.get();
        Meeting toMeetingData = toMeeting.get();

        agendaRepository.deleteALLByMeeting(toMeetingData);

        Optional<AddMember> addMember = addMemberRepository.findById(2L); // assuming ID type is Long
        AddMember member = addMember.get();

        List<Agenda> meetingList = agendaRepository.findAllByMeeting(fromMeetingData);
        List<Agenda> meetingListSave = new ArrayList<>();

        for (Agenda agenda : meetingList) {
            Agenda newAgenda = new Agenda();

            newAgenda.setActivity(agenda.getActivity());
            newAgenda.setAgendaCreatedDate(LocalDateTime.now());
            newAgenda.setAvgTime(agenda.getAvgTime());
            newAgenda.setMinTime(agenda.getMinTime());
            newAgenda.setMaxTime(agenda.getMaxTime());
            newAgenda.setMeeting(toMeetingData);
            newAgenda.setMember(member);

            meetingListSave.add(newAgenda);
        }

        List<Agenda> agendaList = agendaRepository.saveAll(meetingListSave);

        return ResponseEntity.status(HttpStatus.OK)
                .body(agendaList.stream().map(mapper::toDto).collect(Collectors.toList()));
    }*/
}
