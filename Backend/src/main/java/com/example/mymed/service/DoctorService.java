package com.example.mymed.service;

import com.example.mymed.model.Doctor;
import com.example.mymed.repository.DoctorRepository;


import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    public Doctor create(Doctor doctor) {
        return doctorRepository.save(doctor);
    }
}