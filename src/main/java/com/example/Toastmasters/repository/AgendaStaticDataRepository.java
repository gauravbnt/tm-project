package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.agenda.AgendaStaticData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgendaStaticDataRepository extends JpaRepository<AgendaStaticData, Long> {
    Optional<AgendaStaticData> findByInfoKeyOrInfoValue(String keyOrValue, String keyOrValue1);
}
