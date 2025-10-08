package com.example.Toastmasters.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendaResponseDTO {
    private Long agendaId;
    private String minTime;
    private String avgTime;
    private String maxTime;
    private String activity;
    private LocalDateTime agendaCreatedDate;
    private Long memberId;
    private Long meetingId;
}