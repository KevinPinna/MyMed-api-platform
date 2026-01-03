// src/main/java/com/example/mymed/dto/PatientSelfRegisterRequest.java
package com.example.mymed.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientSelfRegisterRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(min = 2, max = 100)
    private String surname;

    @NotBlank(message = "Il codice fiscale è obbligatorio")
    @Size(min = 16, max = 16, message = "Il codice fiscale deve avere 16 caratteri")
    @Pattern(regexp = "^[A-Za-z0-9]{16}$", message = "Codice fiscale non valido")
    private String fiscalCode;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Formato email non valido")
    private String email;

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, message = "La password deve avere almeno 8 caratteri")
    private String password;

    @NotBlank(message = "La conferma password è obbligatoria")
    private String confirmPassword;

    @Size(max = 20)
    private String phone;
}
