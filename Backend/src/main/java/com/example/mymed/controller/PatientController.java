package com.example.mymed.controller;

import com.example.mymed.dto.PatientRequest;
import com.example.mymed.model.Patient;
import com.example.mymed.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService service;

    // Crea paziente
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Patient create(@Valid @RequestBody PatientRequest request) {
        return service.create(request);
    }

    // Tutti i pazienti (admin, medici)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public List<Patient> getAll() {
        return service.findAll();
    }

    // Dettaglio paziente
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public Patient getById(@PathVariable String id) {
        return service.findById(id);
    }

    // Elimina paziente
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
