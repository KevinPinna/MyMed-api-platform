// src/main/java/com/example/mymed/service/VisitReportService.java
package com.example.mymed.service;

import com.example.mymed.dto.VisitReportRequest;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.VisitReport;
import com.example.mymed.repository.VisitReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitReportService {

    private final VisitReportRepository visitReportRepository;
    private final AppointmentService appointmentService;

    // Crea o aggiorna il referto per un dato appuntamento.
    public VisitReport createOrUpdate(VisitReportRequest request) {
        VisitReport report = visitReportRepository
                .findByAppointmentId(request.getAppointmentId())
                .orElseGet(VisitReport::new);

        report.setDoctorId(request.getDoctorId());
        report.setPatientId(request.getPatientId());
        report.setAppointmentId(request.getAppointmentId());
        report.setAnamnesis(request.getAnamnesis());
        report.setObjectiveDiagnosis(request.getObjectiveDiagnosis());
        report.setTherapy(request.getTherapy());

        if (report.getId() == null) {
            report.setCreatedAt(LocalDateTime.now());
        }
        report.setUpdatedAt(LocalDateTime.now());

        VisitReport saved = visitReportRepository.save(report);

        //Quando il dottore compila il referto completa anche l'appuntamento
        try {
            appointmentService.complete(request.getAppointmentId());
        } catch (Exception ignored) {
            // se non è possibile completare
        }

        return saved;
    }

    public VisitReport getByAppointment(String appointmentId) {
        return visitReportRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Referto non trovato per appuntamento: " + appointmentId
                ));
    }

    public VisitReport getById(String id) {
        return visitReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Referto non trovato con id: " + id
                ));
    }

    // Ricerca referti:
    public List<VisitReport> search(String doctorId, String patientId) {
        if (doctorId != null && !doctorId.isBlank()
                && patientId != null && !patientId.isBlank()) {
            return visitReportRepository
                    .findByDoctorIdAndPatientIdOrderByCreatedAtDesc(doctorId, patientId);
        }

        if (patientId != null && !patientId.isBlank()) {
            return visitReportRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        }

        if (doctorId != null && !doctorId.isBlank()) {
            return visitReportRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        }
        
        return visitReportRepository.findAll();
    }
}
