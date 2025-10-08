package com.example.Toastmasters.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.example.Toastmasters.entity.agenda.Abbreviations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AbbreviationsRepository extends JpaRepository<Abbreviations, Long> {
    Optional<Abbreviations> findByAbbreviation(String abbreviation);

}
