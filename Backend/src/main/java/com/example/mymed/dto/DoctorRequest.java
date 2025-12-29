package com.example.mymed.dto;

import com.example.mymed.model.DoctorAvailabilityDays;
import com.example.mymed.model.DoctorAvailabilityShift;
import com.example.mymed.model.DoctorSpecialization;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class DoctorRequest {

    @NotBlank(message = "Il Nome è richiesto")
    @Size(min = 2, max = 100)
    private String name;

    @NotNull(message = "La Specializzazione è richiesta")
    private DoctorSpecialization specialization;

    @NotEmpty(message = "La disponibilità settimanale è richiesta")
    private Set<DoctorAvailabilityDays> availabilityDays;

    @NotNull(message = "La disponibilità oraria è richiesta")
    private DoctorAvailabilityShift availabilityShift;
}
