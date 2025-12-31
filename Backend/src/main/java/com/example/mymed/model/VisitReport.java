// src/main/java/com/example/mymed/model/VisitReport.java
package com.example.mymed.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document("visit_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitReport {

    @Id
    private String id;

    private String doctorId;
    private String patientId;
    private String appointmentId;

    private String anamnesis;
    private String objectiveDiagnosis;
    private String therapy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
