package com.example.mymed.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class DoctorPatchRequest {

    private String specialization;         // es: "CARDIOLOGY" oppure "Cardiologo"
    private Set<String> availabilityDays;  // es: ["MONDAY","WEDNESDAY"]
    private String availabilityShift;      // es: "MORNING"
}
