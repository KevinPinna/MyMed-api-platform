package com.example.mymed.controller;

import com.example.mymed.dto.DoctorRequest;
import com.example.mymed.model.Doctor;
import com.example.mymed.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin("http://localhost:5173")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<Doctor> getAll() {
        return doctorService.getAll();
    }

    @PostMapping
    public Doctor create(@Valid @RequestBody DoctorRequest request) {
        return doctorService.create(request);
    }

    @GetMapping("/{id}")
    public Doctor getById(@PathVariable String id) {
        return doctorService.getById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        doctorService.delete(id);
    }
}
