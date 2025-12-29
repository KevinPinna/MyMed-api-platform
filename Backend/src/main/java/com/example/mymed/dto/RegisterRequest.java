package com.example.mymed.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "La email è obbligatoria")
    @Email(message = "Formato email non valido")
    private String email;

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, message = "La password deve avere almeno 8 caratteri")
    private String password;

    @NotBlank(message = "Il ruolo è obbligatorio (ADMIN, DOCTOR, PATIENT)")
    private String role;

    //Se role = DOCTOR → obbligatorio
    private String doctorId;

    //Se role = PATIENT → obbligatorio
    private String patientId;
}
