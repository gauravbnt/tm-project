package com.example.Toastmasters.repository;

import com.example.Toastmasters.entity.agenda.ClubOfficers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubOfficersRepository extends JpaRepository<ClubOfficers,Long> {
}
