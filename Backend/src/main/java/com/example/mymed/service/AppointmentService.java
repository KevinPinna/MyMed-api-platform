package com.example.mymed.service;

import com.example.mymed.dto.AppointmentRequest;
import com.example.mymed.exception.BadRequestException;
import com.example.mymed.exception.ForbiddenException;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.Appointment;
import com.example.mymed.model.AppointmentStatus;
import com.example.mymed.model.Doctor;
import com.example.mymed.model.Patient;
import com.example.mymed.model.UserAccount;
import com.example.mymed.repository.AppointmentRepository;
import com.example.mymed.repository.DoctorRepository;
import com.example.mymed.repository.PatientRepository;
import com.example.mymed.security.CurrentUserService;
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
    private final CurrentUserService currentUserService;

    public Appointment create(AppointmentRequest request) {

        // Utente loggato
        UserAccount current = currentUserService.getCurrentUser();

        // di base prendo gli id dal body
        String doctorId = request.getDoctorId();
        String patientId = request.getPatientId();

        // Se è un DOCTOR → forzo doctorId dal suo account
        if (currentUserService.isDoctor()) {
            if (current.getDoctorId() == null) {
                throw new BadRequestException("Il tuo account non è collegato a nessun dottore");
            }
            doctorId = current.getDoctorId();
        }

        // Se è un PATIENT → forzo patientId dal suo account
        if (currentUserService.isPatient()) {
            if (current.getPatientId() == null) {
                throw new BadRequestException("Il tuo account non è collegato a nessun paziente");
            }
            patientId = current.getPatientId();
        }

        // Se è ADMIN deve comunque passare doctorId e patientId nel body
        if (doctorId == null || doctorId.isBlank()) {
            throw new BadRequestException("doctorId è obbligatorio");
        }
        if (patientId == null || patientId.isBlank()) {
            throw new BadRequestException("patientId è obbligatorio");
        }

        // Verifico che il doctor esista
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Dottore non trovato"));

        // Verifico che il paziente esista
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Paziente non trovato"));

        // Validazione orario di lavoro e formato slot
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

        // Normalizzo la data/ora allo scoccare dell'ora
        LocalDateTime slotStart = dateTime.withMinute(0).withSecond(0).withNano(0);

        // Controllo se esiste già un appuntamento in quello slot per quel dottore
        boolean exists = appointmentRepository
                .existsByDoctorIdAndDateTime(doctor.getId(), slotStart);

        if (exists) {
            throw new BadRequestException("Il dottore ha già un appuntamento in questa fascia oraria");
        }

        // Audit
        LocalDateTime now = LocalDateTime.now();
        Integer duration = (request.getDurationMinutes() != null)
                ? request.getDurationMinutes()
                : 60; // default 60 min

        // Creo l'appuntamento
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
                .createdBy(current.getEmail()) // ora salviamo chi l'ha creato
                .build();

        return appointmentRepository.save(appointment);
    }

    // Solo ADMIN (controllato dal Controller con @PreAuthorize)
    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    public Appointment findById(String id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appuntamento non trovato con id: " + id));

        UserAccount current = currentUserService.getCurrentUser();

        // ADMIN può vedere tutto
        if (currentUserService.isAdmin()) {
            return appointment;
        }

        // DOCTOR: solo appuntamenti del proprio doctorId
        if (currentUserService.isDoctor()) {
            String doctorId = current.getDoctorId();
            if (doctorId != null && doctorId.equals(appointment.getDoctorId())) {
                return appointment;
            }
            throw new ForbiddenException("Non puoi visualizzare appuntamenti di altri dottori");
        }

        // PATIENT: solo i propri appuntamenti
        if (currentUserService.isPatient()) {
            String patientId = current.getPatientId();
            if (patientId != null && patientId.equals(appointment.getPatientId())) {
                return appointment;
            }
            throw new ForbiddenException("Non puoi visualizzare appuntamenti di altri pazienti");
        }

        // fallback
        throw new ForbiddenException("Non hai i permessi per visualizzare questo appuntamento");
    }

    public List<Appointment> findByDoctor(String doctorId) {
        UserAccount current = currentUserService.getCurrentUser();

        // ADMIN può chiedere appuntamenti per qualunque doctorId
        if (currentUserService.isAdmin()) {
            return appointmentRepository.findByDoctorId(doctorId);
        }

        // DOCTOR ignora il path param e usa il proprio doctorId
        if (currentUserService.isDoctor()) {
            String currentDoctorId = current.getDoctorId();
            if (currentDoctorId == null) {
                throw new BadRequestException("Il tuo account non è collegato a nessun dottore");
            }
            return appointmentRepository.findByDoctorId(currentDoctorId);
        }

        throw new ForbiddenException("Non hai i permessi per visualizzare gli appuntamenti del dottore");
    }

    public List<Appointment> findByPatient(String patientId) {
        UserAccount current = currentUserService.getCurrentUser();

        // ADMIN può chiedere appuntamenti per qualunque paziente
        if (currentUserService.isAdmin()) {
            return appointmentRepository.findByPatientId(patientId);
        }

        // PATIENT ignora il path param e usa il proprio patientId
        if (currentUserService.isPatient()) {
            String currentPatientId = current.getPatientId();
            if (currentPatientId == null) {
                throw new BadRequestException("Il tuo account non è collegato a nessun paziente");
            }
            return appointmentRepository.findByPatientId(currentPatientId);
        }

        throw new ForbiddenException("Non hai i permessi per visualizzare gli appuntamenti del paziente");
    }

    public void cancel(String id) {
        Appointment appointment = findById(id); // qui dentro fa già i controlli di ruolo/owner

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
        // Solo ADMIN e DOCTOR arrivano qui (da @PreAuthorize sul controller),
        // ma usiamo comunque findById per garantire che il dottore non tocchi appuntamenti altrui
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

        // lato security: DELETE è già limitato a ADMIN nel controller, quindi non servono altri controlli
        appointmentRepository.deleteById(id);
    }
}
