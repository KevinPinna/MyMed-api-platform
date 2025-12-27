package com.example.mymed.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AppointmentRequest {

    @NotBlank(message = "L'id del dottore è obbligatorio")
    private String doctorId;

    @NotBlank(message = "L'id del paziente è obbligatorio")
    private String patientId;

    @NotNull(message = "La data e ora della visita sono obbligatorie")
    @Future(message = "La visita deve essere in una data futura")
    private LocalDateTime dateTime;
}
