package com.example.mymed.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRescheduleRequest {

    @NotNull(message = "La nuova data/ora è obbligatoria")
    private LocalDateTime dateTime;
}
