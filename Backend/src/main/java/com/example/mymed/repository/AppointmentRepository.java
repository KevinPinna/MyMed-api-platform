package com.example.mymed.repository;

import com.example.mymed.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByDoctorId(String doctorId);

    List<Appointment> findByPatientId(String patientId);

    boolean existsByDoctorIdAndDateTime(String doctorId, LocalDateTime dateTime);

    // usato per la riprogrammazione: controlla se esiste un altro appuntamento nello stesso slot
    boolean existsByDoctorIdAndDateTimeAndIdNot(String doctorId, LocalDateTime dateTime, String id);
}
