package com.example.mymed.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Il motivo della visita è obbligatorio")
    private String reason;

    @Size(max = 500, message = "Le note possono avere al massimo 500 caratteri")
    private String notes;

    @Min(value = 15, message = "La durata minima è 15 minuti")
    @Max(value = 60, message = "La durata massima è 60 minuti")
    private Integer durationMinutes;  //Se null mette default nel service
}
