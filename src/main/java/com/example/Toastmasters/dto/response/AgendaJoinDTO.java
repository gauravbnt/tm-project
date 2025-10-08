package com.example.Toastmasters.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendaJoinDTO {

    private List<AgendaStaticDataResponseDTO> agendaStaticInfo;

    private List<ClubOfficersResponseDTO> clubOfficers;

    private List<AgendaResponseDTO> agenda;

   // private List<SpeakerSpeechResponseDTO> speakerSpeech;

   // private List<GrammarianResponseDTO> grammarian;

    private List<AbbreviationsResponseDTO> abbreviations;

}
