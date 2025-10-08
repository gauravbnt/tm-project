package com.example.Toastmasters.entity.agenda;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class Abbreviations {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long abbreviationId;
    private String abbreviation;
    private String meaning;
}
