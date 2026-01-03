// src/main/java/com/example/mymed/service/AppointmentService.java
package com.example.mymed.service;

import com.example.mymed.dto.AppointmentRequest;
import com.example.mymed.exception.BadRequestException;
import com.example.mymed.exception.ForbiddenException;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.Appointment;
import com.example.mymed.model.AppointmentStatus;
import com.example.mymed.model.Doctor;
import com.example.mymed.model.Notification;
import com.example.mymed.model.Patient;
import com.example.mymed.model.UserAccount;
import com.example.mymed.repository.AppointmentRepository;
import com.example.mymed.repository.DoctorRepository;
import com.example.mymed.repository.PatientRepository;
import com.example.mymed.repository.UserAccountRepository;
import com.example.mymed.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final CurrentUserService currentUserService;

    // notifiche
    private final NotificationService notificationService;
    private final UserAccountRepository userAccountRepository;

    // Formatter italiano per le notifiche: "31/01/2026 alle 09:00"
    private static final DateTimeFormatter ITALIAN_DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'alle' HH:mm");

    private String formatDateTime(LocalDateTime dt) {
        if (dt == null) return "";
        return dt.format(ITALIAN_DATE_TIME_FORMATTER);
    }

    public Appointment create(AppointmentRequest request) {

        // Utente loggato
        UserAccount current = currentUserService.getCurrentUser();

        // di base prendo gli id dal body
        String doctorId = request.getDoctorId();
        String patientId = request.getPatientId();

        // Se è un DOCTOR forzo doctorId dal suo account
        if (currentUserService.isDoctor()) {
            if (current.getDoctorId() == null) {
                throw new BadRequestException("Il tuo account non è collegato a nessun dottore");
            }
            doctorId = current.getDoctorId();
        }

        // Se è un PATIENT forzo patientId dal suo account
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

        LocalDateTime dateTime = request.getDateTime();
        if (dateTime == null) {
            throw new BadRequestException("La data/ora dell'appuntamento è obbligatoria");
        }

        // normalizzo allo scoccare dell'ora e controllo orario + slot libero
        LocalDateTime slotStart = normalizeToHour(dateTime);
        validateSlot(doctor.getId(), slotStart, null);

        // Audit
        LocalDateTime now = LocalDateTime.now();
        Integer duration = (request.getDurationMinutes() != null)
                ? request.getDurationMinutes()
                : 60;

        AppointmentStatus initialStatus = currentUserService.isPatient()
                ? AppointmentStatus.SENDED
                : AppointmentStatus.BOOKED;

        // Creo l'appuntamento
        Appointment appointment = Appointment.builder()
                .doctorId(doctor.getId())
                .patientId(patient.getId())
                .dateTime(slotStart)
                .proposedDateTime(null)
                .status(initialStatus)
                .reason(request.getReason())
                .notes(request.getNotes())
                .durationMinutes(duration)
                .createdAt(now)
                .updatedAt(now)
                .createdBy(current.getEmail())
                .build();

        return appointmentRepository.save(appointment);
    }

    // Solo ADMIN
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

        throw new ForbiddenException("Non hai i permessi per visualizzare questo appuntamento");
    }

    public List<Appointment> findByDoctor(String doctorId) {
        UserAccount current = currentUserService.getCurrentUser();

        // ADMIN può chiedere appuntamenti per qualunque doctorId
        if (currentUserService.isAdmin()) {
            return appointmentRepository.findByDoctorId(doctorId);
        }

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

        // notifica paziente se l'annullamento viene da DOCTOR/ADMIN
        notifyPatientAppointmentCancelled(appointment);
    }

    public void complete(String id) {
        // Solo ADMIN e DOCTOR arrivano qui
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

    public Appointment doctorAccept(String id) {
        UserAccount current = currentUserService.getCurrentUser();

        if (!currentUserService.isDoctor()) {
            throw new ForbiddenException("Solo il dottore può accettare l'appuntamento");
        }

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appuntamento non trovato con id: " + id));

        if (appointment.getDoctorId() == null ||
                !appointment.getDoctorId().equals(current.getDoctorId())) {
            throw new ForbiddenException("Non puoi modificare appuntamenti di altri dottori");
        }

        if (appointment.getStatus() != AppointmentStatus.SENDED) {
            throw new BadRequestException("Solo le richieste in attesa possono essere accettate");
        }

        appointment.setStatus(AppointmentStatus.BOOKED);
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);

        // notifica il paziente che la visita è stata confermata
        notifyPatientAppointmentConfirmed(saved);

        return saved;
    }

    public Appointment doctorReschedule(String id, LocalDateTime newDateTime) {
        if (newDateTime == null) {
            throw new BadRequestException("La nuova data/ora è obbligatoria");
        }

        UserAccount current = currentUserService.getCurrentUser();

        if (!currentUserService.isDoctor()) {
            throw new ForbiddenException("Solo il dottore può riprogrammare l'appuntamento");
        }

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appuntamento non trovato con id: " + id));

        // controllo che l'appuntamento appartenga a questo dottore
        if (appointment.getDoctorId() == null ||
                !appointment.getDoctorId().equals(current.getDoctorId())) {
            throw new ForbiddenException("Non puoi modificare appuntamenti di altri dottori");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELED ||
                appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Non è possibile riprogrammare un appuntamento annullato o completato");
        }

        // normalizzo e verifico slot
        LocalDateTime slotStart = normalizeToHour(newDateTime);
        validateSlot(appointment.getDoctorId(), slotStart, appointment.getId());

        LocalDateTime oldDateTime = appointment.getDateTime();

        // Imposto proposta e stato "in attesa paziente"
        appointment.setProposedDateTime(slotStart);
        appointment.setStatus(AppointmentStatus.PENDING_PATIENT);
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);

        // notifica il paziente che il dottore ha proposto un nuovo orario
        notifyPatientAppointmentRescheduled(saved, oldDateTime);

        return saved;
    }

    public Appointment patientAcceptReschedule(String id) {
        UserAccount current = currentUserService.getCurrentUser();

        if (!currentUserService.isPatient()) {
            throw new ForbiddenException("Solo il paziente può confermare la riprogrammazione");
        }

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appuntamento non trovato con id: " + id));

        // controllo che l'appuntamento sia del paziente corrente
        if (appointment.getPatientId() == null ||
                !appointment.getPatientId().equals(current.getPatientId())) {
            throw new ForbiddenException("Non puoi modificare appuntamenti di altri pazienti");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING_PATIENT ||
                appointment.getProposedDateTime() == null) {
            throw new BadRequestException("Non c'è alcuna riprogrammazione in attesa di conferma per questo appuntamento");
        }

        // quando il paziente accetta, la data effettiva diventa la proposta
        appointment.setDateTime(appointment.getProposedDateTime());
        appointment.setProposedDateTime(null);
        appointment.setStatus(AppointmentStatus.BOOKED);
        appointment.setUpdatedAt(LocalDateTime.now());

        return appointmentRepository.save(appointment);
    }

    public void patientRejectReschedule(String id) {
        UserAccount current = currentUserService.getCurrentUser();

        if (!currentUserService.isPatient()) {
            throw new ForbiddenException("Solo il paziente può rifiutare la riprogrammazione");
        }

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appuntamento non trovato con id: " + id));

        if (appointment.getPatientId() == null ||
                !appointment.getPatientId().equals(current.getPatientId())) {
            throw new ForbiddenException("Non puoi modificare appuntamenti di altri pazienti");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING_PATIENT ||
                appointment.getProposedDateTime() == null) {
            throw new BadRequestException("Non c'è alcuna riprogrammazione in attesa di conferma per questo appuntamento");
        }

        // se rifiuta, annulliamo l'appuntamento
        appointment.setStatus(AppointmentStatus.CANCELED);
        appointment.setProposedDateTime(null);
        appointment.setUpdatedAt(LocalDateTime.now());

        appointmentRepository.save(appointment);
    }

    private LocalDateTime normalizeToHour(LocalDateTime dateTime) {
        // arrotondo allo scoccare dell'ora
        LocalDateTime normalized = dateTime.withMinute(0).withSecond(0).withNano(0);

        int hour = normalized.getHour();
        int minute = normalized.getMinute();

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

        return normalized;
    }

    private void validateSlot(String doctorId, LocalDateTime slotStart, String excludeAppointmentId) {
        boolean exists;
        if (excludeAppointmentId == null) {
            exists = appointmentRepository.existsByDoctorIdAndDateTime(doctorId, slotStart);
        } else {
            exists = appointmentRepository
                    .existsByDoctorIdAndDateTimeAndIdNot(doctorId, slotStart, excludeAppointmentId);
        }

        if (exists) {
            throw new BadRequestException("Il dottore ha già un appuntamento in questa fascia oraria");
        }
    }

    private void notifyPatientAppointmentCancelled(Appointment appointment) {
        // se non c'è paziente associato non ha senso notificare
        if (appointment.getPatientId() == null) {
            return;
        }

        UserAccount current = currentUserService.getCurrentUser();

        // notifica il paziente SOLO se chi annulla è DOCTOR o ADMIN
        if (!(currentUserService.isDoctor() || currentUserService.isAdmin())) {
            return;
        }

        var patientUserOpt = userAccountRepository.findByPatientId(appointment.getPatientId());
        if (patientUserOpt.isEmpty()) {
            return; // nessun account associato ⇒ niente notifica
        }
        UserAccount patientUser = patientUserOpt.get();

        Doctor doctor = null;
        if (appointment.getDoctorId() != null) {
            doctor = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
        }

        String doctorName = (doctor != null ? doctor.getName() : "il tuo medico");

        String when = formatDateTime(appointment.getDateTime());

        String message = "Il tuo appuntamento con " + doctorName;
        if (!when.isEmpty()) {
            message += " del " + when;
        }
        message += " è stato annullato dalla clinica.";

        Notification notification = Notification.builder()
                .userId(patientUser.getId())
                .title("Appuntamento annullato")
                .message(message)
                .type("APPOINTMENT_CANCELED")
                .appointmentId(appointment.getId())
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();

        notificationService.createNotification(notification);
    }

    private void notifyPatientAppointmentRescheduled(Appointment appointment, LocalDateTime oldDateTime) {
        if (appointment.getPatientId() == null) {
            return;
        }

        // notifica solo se chi ha fatto la modifica è un dottore
        if (!currentUserService.isDoctor()) {
            return;
        }

        var patientUserOpt = userAccountRepository.findByPatientId(appointment.getPatientId());
        if (patientUserOpt.isEmpty()) {
            return;
        }
        UserAccount patientUser = patientUserOpt.get();

        Doctor doctor = null;
        if (appointment.getDoctorId() != null) {
            doctor = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
        }

        String doctorName = (doctor != null ? doctor.getName() : "il tuo medico");

        String oldWhen = oldDateTime != null ? formatDateTime(oldDateTime) : "";
        String newWhen = appointment.getProposedDateTime() != null
                ? formatDateTime(appointment.getProposedDateTime())
                : "";

        StringBuilder msg = new StringBuilder();
        msg.append("Il dottore ").append(doctorName)
                .append(" ha proposto una nuova data/ora per il tuo appuntamento.");

        if (!oldWhen.isEmpty()) {
            msg.append(" Precedente: ").append(oldWhen).append(".");
        }
        if (!newWhen.isEmpty()) {
            msg.append(" Nuova proposta: ").append(newWhen).append(".");
        }
        msg.append(" Puoi accettare o rifiutare dalla sezione Appuntamenti.");

        Notification notification = Notification.builder()
                .userId(patientUser.getId())
                .title("Appuntamento riprogrammato")
                .message(msg.toString())
                .type("APPOINTMENT_RESCHEDULED")
                .appointmentId(appointment.getId())
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();

        notificationService.createNotification(notification);
    }

    //appuntamento confermato dal dottore
    private void notifyPatientAppointmentConfirmed(Appointment appointment) {
        if (appointment.getPatientId() == null) {
            return;
        }

        var patientUserOpt = userAccountRepository.findByPatientId(appointment.getPatientId());
        if (patientUserOpt.isEmpty()) {
            return;
        }
        UserAccount patientUser = patientUserOpt.get();

        Doctor doctor = null;
        if (appointment.getDoctorId() != null) {
            doctor = doctorRepository.findById(appointment.getDoctorId()).orElse(null);
        }

        String doctorName = (doctor != null ? doctor.getName() : "il tuo medico");

        String when = formatDateTime(appointment.getDateTime());

        StringBuilder msg = new StringBuilder();
        msg.append("Il tuo appuntamento con ").append(doctorName);
        if (!when.isEmpty()) {
            msg.append(" del ").append(when);
        }
        msg.append(" è stato confermato.");

        Notification notification = Notification.builder()
                .userId(patientUser.getId())
                .title("Appuntamento confermato")
                .message(msg.toString())
                .type("APPOINTMENT_CONFIRMED")
                .appointmentId(appointment.getId())
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();

        notificationService.createNotification(notification);
    }
}
