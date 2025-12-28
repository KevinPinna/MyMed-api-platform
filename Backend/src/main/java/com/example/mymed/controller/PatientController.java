package com.example.mymed.controller;

import com.example.mymed.dto.PatientRequest;
import com.example.mymed.model.Patient;
import com.example.mymed.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService service;

    @PostMapping
    public Patient create(@Valid @RequestBody PatientRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<Patient> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
