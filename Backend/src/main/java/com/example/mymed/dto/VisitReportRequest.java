// src/main/java/com/example/mymed/dto/VisitReportRequest.java
package com.example.mymed.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VisitReportRequest {

    @NotBlank(message = "Il doctorId è richiesto")
    private String doctorId;

    @NotBlank(message = "Il patientId è richiesto")
    private String patientId;

    @NotBlank(message = "L'appuntamento è richiesto")
    private String appointmentId;

    @NotBlank(message = "L'anamnesi è richiesta")
    private String anamnesis;

    @NotBlank(message = "La diagnosi obiettiva è richiesta")
    private String objectiveDiagnosis;

    @NotBlank(message = "La terapia è richiesta")
    private String therapy;
}
