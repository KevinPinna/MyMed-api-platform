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
    private LocalDateTime dateTime;
    private LocalDateTime proposedDateTime;

    // info di business
    private AppointmentStatus status;
    private String reason;
    private String notes;
    private Integer durationMinutes;

    // audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
}
