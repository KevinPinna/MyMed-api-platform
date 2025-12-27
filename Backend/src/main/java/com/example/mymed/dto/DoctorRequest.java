package com.example.mymed.dto;

//Dichiarazione del DTO di doctor da usare all'interno dell'API REST, serve per la validazione dei campi e gestire le eccezioni
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorRequest {

    @NotBlank(message = "Il Nome è richiesto")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "La Specializzazione è richiesta")
    @Size(min = 2, max = 100)
    private String specialization;
}
