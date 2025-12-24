package dev.kevin.mymed.service;

import dev.kevin.mymed.model.Doctor;
import dev.kevin.mymed.repository.DoctorRepository;


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
