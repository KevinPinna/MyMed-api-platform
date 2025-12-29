package com.example.mymed.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String role;
    private String email;

    //collegamento all'attore di dominio
    private String doctorId;  // null se NON è un dottore
    private String patientId; // null se NON è un paziente
}
