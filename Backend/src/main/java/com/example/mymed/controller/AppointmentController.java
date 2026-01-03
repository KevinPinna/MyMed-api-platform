// src/main/java/com/example/mymed/controller/AppointmentController.java
package com.example.mymed.controller;

import com.example.mymed.dto.AppointmentRequest;
import com.example.mymed.dto.AppointmentRescheduleRequest;
import com.example.mymed.model.Appointment;
import com.example.mymed.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentService service;

    // Crea un nuovo appuntamento
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public Appointment create(@Valid @RequestBody AppointmentRequest request) {
        return service.create(request);
    }

    // Tutti gli appuntamenti (solo admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Appointment> getAll() {
        return service.findAll();
    }

    // Dettaglio singolo appuntamento
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public Appointment getById(@PathVariable String id) {
        return service.findById(id);
    }

    // Appuntamenti per dottore
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public List<Appointment> getByDoctor(@PathVariable String doctorId) {
        return service.findByDoctor(doctorId);
    }

    // Appuntamenti per paziente
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','PATIENT')")
    public List<Appointment> getByPatient(@PathVariable String patientId) {
        return service.findByPatient(patientId);
    }

    // Annulla appuntamento (soft delete)
    @PatchMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public void cancel(@PathVariable String id) {
        service.cancel(id);
    }

    // Segna come completato
    @PatchMapping("/{id}/complete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public void complete(@PathVariable String id) {
        service.complete(id);
    }

    //accettazione da parte del dottore
    @PatchMapping("/{id}/doctor-accept")
    @PreAuthorize("hasRole('DOCTOR')")
    public Appointment doctorAccept(@PathVariable String id) {
        return service.doctorAccept(id);
    }

    //Riprogrammazione dal dottore
    @PatchMapping("/{id}/doctor-reschedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public Appointment doctorReschedule(
            @PathVariable String id,
            @Valid @RequestBody AppointmentRescheduleRequest request
    ) {
        return service.doctorReschedule(id, request.getDateTime());
    }

    //patient-accept
    @PatchMapping("/{id}/patient-accept")
    @PreAuthorize("hasRole('PATIENT')")
    public Appointment patientAccept(@PathVariable String id) {
        return service.patientAcceptReschedule(id);
    }

    //patient-confirm
    @PatchMapping("/{id}/patient-confirm")
    @PreAuthorize("hasRole('PATIENT')")
    public Appointment patientConfirm(@PathVariable String id) {
        return service.patientAcceptReschedule(id);
    }

    // Rifiuto nuova data/ora
    @PatchMapping("/{id}/patient-reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PATIENT')")
    public void patientReject(@PathVariable String id) {
        service.patientRejectReschedule(id);
    }

    // Alias eventuale
    @PatchMapping("/{id}/patient-decline")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PATIENT')")
    public void patientDecline(@PathVariable String id) {
        service.patientRejectReschedule(id);
    }

    // Cancella definitivamente
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
