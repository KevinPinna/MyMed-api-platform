package com.example.mymed.service;

import com.example.mymed.dto.AppointmentRequest;
import com.example.mymed.exception.BadRequestException;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.Appointment;
import com.example.mymed.model.AppointmentStatus;
import com.example.mymed.model.Doctor;
import com.example.mymed.model.Patient;
import com.example.mymed.repository.AppointmentRepository;
import com.example.mymed.repository.DoctorRepository;
import com.example.mymed.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public Appointment create(AppointmentRequest request) {

        //Verifico che il doctor esista
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Dottore non trovato"));

        //Verifico che il paziente esista
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paziente non trovato"));

        //Validazione orario di lavoro e formato slot
        LocalDateTime dateTime = request.getDateTime();
        int hour = dateTime.getHour();
        int minute = dateTime.getMinute();

        boolean inMorning = hour >= 9 && hour < 13;
        boolean inAfternoon = hour >= 14 && hour < 18;

        if (!(inMorning || inAfternoon)) {
            throw new BadRequestException(
                    "Le visite sono prenotabili solo tra le 09:00-13:00 e 14:00-18:00"
            );
        }

        if (minute != 0) {
            throw new BadRequestException(
                    "Gli appuntamenti devono iniziare allo scoccare dell'ora (es. 10:00, 11:00)"
            );
        }

        //Normalizzo la data/ora allo scoccare dell'ora
        LocalDateTime slotStart = dateTime.withMinute(0).withSecond(0).withNano(0);

        //Controllo se esiste già un appuntamento in quello slot per quel dottore
        boolean exists = appointmentRepository
                .existsByDoctorIdAndDateTime(doctor.getId(), slotStart);

        if (exists) {
            throw new BadRequestException("Il dottore ha già un appuntamento in questa fascia oraria");
        }

        //Audit
        LocalDateTime now = LocalDateTime.now();
        Integer duration = (request.getDurationMinutes() != null)
                ? request.getDurationMinutes()
                : 60; // default 60 min

        //Creo l'appuntamento
        Appointment appointment = Appointment.builder()
                .doctorId(doctor.getId())
                .patientId(patient.getId())
                .dateTime(slotStart)
                .status(AppointmentStatus.BOOKED)
                .reason(request.getReason())
                .notes(request.getNotes())
                .durationMinutes(duration)
                .createdAt(now)
                .updatedAt(now)
                .createdBy("SYSTEM") //TODO Poi lo collego all'utente autenticato
                .build();

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    public Appointment findById(String id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appuntamento non trovato con id: " + id));
    }

    public List<Appointment> findByDoctor(String doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> findByPatient(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public void cancel(String id) {
        Appointment appointment = findById(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Un appuntamento completato non può essere annullato");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELED) {
            throw new BadRequestException("L'appuntamento è già annullato");
        }

        appointment.setStatus(AppointmentStatus.CANCELED);
        appointment.setUpdatedAt(LocalDateTime.now());

        appointmentRepository.save(appointment);
    }

    public void complete(String id) {
        Appointment appointment = findById(id);

        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new BadRequestException("Solo un appuntamento prenotato può essere completato");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setUpdatedAt(LocalDateTime.now());

        appointmentRepository.save(appointment);
    }

    public void delete(String id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appuntamento non trovato con id: " + id);
        }
        appointmentRepository.deleteById(id);
    }
}
