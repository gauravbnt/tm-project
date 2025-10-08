package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.Agenda;
import com.example.Toastmasters.entity.Meeting;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgendaRepository extends JpaRepository<Agenda, Long> {

    List<Agenda> findAllByMeetingId(Long meetingId);

    @Transactional
    void deleteALLByMeetingId(Long meetingId);

}
