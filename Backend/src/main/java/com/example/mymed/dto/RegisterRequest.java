package com.example.mymed.dto;

import com.example.mymed.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @Email(message = "Email non valida")
    @NotBlank(message = "L'email è obbligatoria")
    private String email;

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 6, max = 100, message = "La password deve avere tra 6 e 100 caratteri")
    private String password;

    @NotBlank(message = "Il ruolo è obbligatorio (ADMIN, DOCTOR, PATIENT)")
    private String role;  // lo converto da enum Role

    // TODO li userò in futuro per legare utente a doctor/patient
    private String doctorId;
    private String patientId;
}
