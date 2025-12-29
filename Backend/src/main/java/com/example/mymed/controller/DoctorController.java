package com.example.mymed.controller;

import com.example.mymed.dto.DoctorRequest;
import com.example.mymed.model.Doctor;
import com.example.mymed.model.DoctorSpecialization;
import com.example.mymed.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // Lista dottori (visibile a tutti gli autenticati)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public List<Doctor> getAll(@RequestParam(required = false) DoctorSpecialization specialization) {
        return doctorService.getAll(specialization);
    }

    // Crea nuovo dottore (solo admin)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Doctor create(@Valid @RequestBody DoctorRequest request) {
        return doctorService.create(request);
    }

    // Dettaglio singolo dottore
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public Doctor getById(@PathVariable String id) {
        return doctorService.getById(id);
    }

    // Elimina dottore (solo admin)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        doctorService.delete(id);
    }
}
