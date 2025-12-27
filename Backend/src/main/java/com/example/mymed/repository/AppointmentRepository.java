package com.example.mymed.repository;

import com.example.mymed.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByDoctorId(String doctorId);

    List<Appointment> findByPatientId(String patientId);

    // Controllo: esiste già un appuntamento per questo dottore a quest'ora esatta?
    boolean existsByDoctorIdAndDateTime(String doctorId, LocalDateTime dateTime);
}
