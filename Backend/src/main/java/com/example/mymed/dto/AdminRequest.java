package com.example.mymed.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(min = 2, max = 100)
    private String surname;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Formato email non valido")
    private String email;

    @NotBlank(message = "Il numero di telefono è obbligatorio")
    @Size(min = 6, max = 20, message = "Il numero di telefono deve avere tra 6 e 20 caratteri")
    private String phone;
}
