package com.example.mymed.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document("appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    private String id;

    private String doctorId;
    private String patientId;

    // data/ora appuntamento
    private LocalDateTime dateTime;

    // info di business
    private AppointmentStatus status;
    private String reason;         // motivo visita (es. Controllo cardiologico)
    private String notes;          // note libere
    private Integer durationMinutes; // durata in minuti (es. 60)

    // audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;      // TODO per ora stringa, poi la collego all'utente autenticato
}
