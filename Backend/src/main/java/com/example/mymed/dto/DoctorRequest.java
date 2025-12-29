package com.example.mymed.dto;

//Dichiarazione del DTO di doctor da usare all'interno dell'API REST, serve per la validazione dei campi e gestire le eccezioni
import com.example.mymed.model.DoctorAvailabilityDays;
import com.example.mymed.model.DoctorAvailabilityShift;
import com.example.mymed.model.DoctorSpecialization;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorRequest {

    @NotBlank(message = "Il Nome è richiesto")
    @Size(min = 2, max = 100)
    private String name;

    @NotNull(message = "La Specializzazione è richiesta")
    private DoctorSpecialization specialization;

    @NotNull(message = "La disponibilità settimanale è richiesta")
    private DoctorAvailabilityDays availabilityDays;

    @NotNull(message = "La disponibilità oraria è richiesta")
    private DoctorAvailabilityShift availabilityShift;
}
