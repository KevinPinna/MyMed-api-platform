package com.example.mymed.controller;

import com.example.mymed.exception.ForbiddenException;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.Patient;
import com.example.mymed.repository.PatientRepository;
import com.example.mymed.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PatientController {

    private final PatientRepository patientRepository;
    private final CurrentUserService currentUserService;

    //ADMIN e DOCTOR possono vedere la lista pazienti
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public List<Patient> getAll() {
        return patientRepository.findAll();
    }

    // ADMIN può leggere qualunque paziente
    // PATIENT può leggere SOLO il proprio patientId
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public Patient getById(@PathVariable String id) {
        if (currentUserService.isAdmin()) {
            return patientRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Paziente non trovato con id: " + id));
        }

        if (currentUserService.isPatient()) {
            String currentPatientId = currentUserService.getCurrentPatientId();
            if (currentPatientId == null || !currentPatientId.equals(id)) {
                throw new ForbiddenException("Non puoi visualizzare altri pazienti");
            }

            return patientRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Paziente non trovato con id: " + id));
        }

        throw new ForbiddenException("Non hai i permessi per visualizzare questo paziente");
    }

    //crea paziente, solo admin
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Patient create(@RequestBody Patient patient) {
        return patientRepository.save(patient);
    }

    //aggiorna paziente, solo admin
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Patient update(@PathVariable String id, @RequestBody Patient input) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paziente non trovato con id: " + id));

        existing.setName(input.getName());
        existing.setSurname(input.getSurname());
        existing.setEmail(input.getEmail());
        existing.setPhone(input.getPhone());
        existing.setFiscalCode(input.getFiscalCode());

        return patientRepository.save(existing);
    }

    //delete, solo admin
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Paziente non trovato con id: " + id);
        }
        patientRepository.deleteById(id);
    }
}
