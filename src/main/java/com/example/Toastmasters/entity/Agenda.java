package com.example.Toastmasters.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Agenda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long agendaId;

    private String minTime;
    private String avgTime;
    private String maxTime;

    private String activity;
    private LocalDateTime agendaCreatedDate = LocalDateTime.now();
    private Long memberId;
    private Long meetingId;



}
