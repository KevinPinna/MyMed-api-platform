package com.example.mymed.controller;

import com.example.mymed.dto.AppointmentRequest;
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
@CrossOrigin("http://localhost:5173")
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
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
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

    // Cancella definitivamente
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
