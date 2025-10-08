package com.example.Toastmasters.mapper;

import com.example.Toastmasters.dto.request.ClubOfficersRequestDTO;
import com.example.Toastmasters.dto.response.ClubOfficersResponseDTO;
import com.example.Toastmasters.entity.AddMember;
import com.example.Toastmasters.entity.agenda.ClubOfficers;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClubOfficersMapper {
    @Mapping(target = "officerId", ignore = true)
    @Mapping(target = "addMember", expression = "java(memberFromId(clubOfficersRequestDTO.getMemberId()))")
    ClubOfficers toEntity(ClubOfficersRequestDTO clubOfficersRequestDTO);

    @Mapping(target = "memberId", source = "addMember.memberId")
    ClubOfficersResponseDTO toDto(ClubOfficers clubOfficers);



    default AddMember memberFromId(Long memberId) {
        AddMember addMember = new AddMember();
        addMember.setMemberId(memberId);
        return addMember;
    }

}
