package com.example.mymed.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(min = 2, max = 100)
    private String surname;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Formato email non valido")
    private String email;

    @NotBlank(message = "Il telefono è obbligatorio")
    @Size(min = 8, max = 20)
    private String phone;
}
