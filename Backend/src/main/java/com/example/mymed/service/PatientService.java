package com.example.mymed.service;

import com.example.mymed.dto.PatientRequest;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.Patient;
import com.example.mymed.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repository;

    public Patient create(PatientRequest request) {
        Patient patient = new Patient(
                null,
                request.getName(),
                request.getSurname(),
                request.getEmail(),
                request.getPhone()
        );

        return repository.save(patient);
    }

    public List<Patient> findAll() {
        return repository.findAll();
    }

    public Patient findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paziente non trovato con id: " + id));
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Paziente non trovato con id: " + id);
        }

        repository.deleteById(id);
    }
}
