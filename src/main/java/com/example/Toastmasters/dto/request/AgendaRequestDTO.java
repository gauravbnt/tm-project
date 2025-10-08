package com.example.Toastmasters.dto.request;

import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.entity.Meeting;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendaRequestDTO {

    private String minTime;
    private String avgTime;
    private String maxTime;
    private String activity;
    private Long memberId;
    private Long meetingId;

}
