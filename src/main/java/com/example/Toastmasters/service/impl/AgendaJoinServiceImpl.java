package com.example.Toastmasters.service.impl;

import com.example.Toastmasters.dto.response.AgendaJoinDTO;
import com.example.Toastmasters.dto.response.MeetingResponseDTO;
import com.example.Toastmasters.entity.Agenda;
import com.example.Toastmasters.entity.Meeting;
import com.example.Toastmasters.entity.agenda.Abbreviations;
import com.example.Toastmasters.entity.agenda.AgendaStaticData;
import com.example.Toastmasters.entity.agenda.ClubOfficers;
import com.example.Toastmasters.mapper.*;
import com.example.Toastmasters.repository.*;
import com.example.Toastmasters.service.AgendaJoinService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendaJoinServiceImpl implements AgendaJoinService {
    private final AgendaStaticDataRepository agendaStaticInfo;
    private final ClubOfficersRepository clubOfficers;
    private final AgendaRepository agenda;
    //private final SpeakerSpeechRepository speakerSpeech;
    //private final GrammarianRepository grammarianRepo;
    private final AbbreviationsRepository abbreviations;
    private final AddMemberRepository addMemberRepository;
    private final MeetingRepository meetingRepository;

    private final AgendaStaticDataMapper staticInfoMapper;
    private final ClubOfficersMapper officersMapper;
    private final AgendaMapper agendaMapper;
    //private final SpeakerSpeechMapper speechMapper;
    //private final GrammarianMapper grammarianMapper;
    private final AbbreviationsMapper abbreviationsMapper;
    private final MeetingMapper meetingMapper;

    public AgendaJoinServiceImpl(AgendaStaticDataRepository agendaStaticInfo, ClubOfficersRepository clubOfficers, AgendaRepository agenda, AbbreviationsRepository abbreviations, AddMemberRepository addMemberRepository, MeetingRepository meetingRepository, AgendaStaticDataMapper staticInfoMapper, ClubOfficersMapper officersMapper, AgendaMapper agendaMapper, AbbreviationsMapper abbreviationsMapper, MeetingMapper meetingMapper) {
        this.agendaStaticInfo = agendaStaticInfo;
        this.clubOfficers = clubOfficers;
        this.agenda = agenda;
        this.abbreviations = abbreviations;
        this.addMemberRepository = addMemberRepository;
        this.meetingRepository = meetingRepository;
        this.staticInfoMapper = staticInfoMapper;
        this.officersMapper = officersMapper;
        this.agendaMapper = agendaMapper;
        this.abbreviationsMapper = abbreviationsMapper;
        this.meetingMapper = meetingMapper;
    }

    @Override
    public ResponseEntity<AgendaJoinDTO> getAgenda(Long meetingId) {

        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        List<AgendaStaticData> staticData = agendaStaticInfo.findAll();

        List<ClubOfficers> clubOfficer = clubOfficers.findAll();

        List<Agenda> agendaList = agenda.findAllByMeetingId(meetingId);

        //List<SpeakerSpeech> speakerSpeeches = speakerSpeech.findAllByMeeting(meetingData);

        //List<Grammarian> grammarians = grammarianRepo.findAllByMeeting(meetingData);

        List<Abbreviations> abbreviationsList = abbreviations.findAll();

        AgendaJoinDTO agendaJoinDTO = new AgendaJoinDTO();

        agendaJoinDTO.setAgendaStaticInfo(staticData.stream()
                .map(x->staticInfoMapper.toDto(x)).collect(Collectors.toList()));
        agendaJoinDTO.setClubOfficers(clubOfficer.stream()
                .map(x->officersMapper.toDto(x)).collect(Collectors.toList()));
        agendaJoinDTO.setAgenda(agendaList.stream()
                .map(x->agendaMapper.toDto(x)).collect(Collectors.toList()));
        /*agendaJoinDTO.setSpeakerSpeech(speakerSpeeches.stream()
                .map(x->speechMapper.toDTO(x)).collect(Collectors.toList()));
        agendaJoinDTO.setGrammarian(grammarians.stream()
                .map(x->grammarianMapper.toResponseDTO(x)).collect(Collectors.toList()));*/
        agendaJoinDTO.setAbbreviations(abbreviationsList.stream()
                .map(x->abbreviationsMapper.toDto(x)).collect(Collectors.toList()));

        return ResponseEntity.ok(agendaJoinDTO);

    }

    @Override
    public ResponseEntity<MeetingResponseDTO> isAgendaPublished(Long meetingId, String status) {
        Optional<Meeting> meeting = meetingRepository.findById(meetingId);

        if (meeting.isEmpty())
            throw new RuntimeException("Meeting not found or empty.");

        Meeting meetingData = meeting.get();
        meetingData.setPublished("published".equalsIgnoreCase(status));

        Meeting meetingPublished = meetingRepository.save(meetingData);

        return ResponseEntity.status(HttpStatus.CREATED).body(meetingMapper.toDto(meetingPublished));
    }

}
