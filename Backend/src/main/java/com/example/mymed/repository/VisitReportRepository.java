// src/main/java/com/example/mymed/repository/VisitReportRepository.java
package com.example.mymed.repository;

import com.example.mymed.model.VisitReport;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface VisitReportRepository extends MongoRepository<VisitReport, String> {

    Optional<VisitReport> findByAppointmentId(String appointmentId);

    // per cartella clinica
    List<VisitReport> findByDoctorIdAndPatientIdOrderByCreatedAtDesc(
            String doctorId,
            String patientId
    );

    List<VisitReport> findByPatientIdOrderByCreatedAtDesc(String patientId);

    List<VisitReport> findByDoctorIdOrderByCreatedAtDesc(String doctorId);
}
