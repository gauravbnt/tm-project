package com.example.Toastmasters.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClubOfficersRequestDTO {
    private String leadershipName;
    private Long memberId;
}
