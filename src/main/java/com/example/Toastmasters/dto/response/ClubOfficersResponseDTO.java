package com.example.Toastmasters.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClubOfficersResponseDTO {
    private Long officerId;
    private String leadershipName;
    private Long memberId;

}
