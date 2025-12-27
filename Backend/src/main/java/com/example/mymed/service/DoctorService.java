package com.example.mymed.service;

import com.example.mymed.dto.DoctorRequest;
import com.example.mymed.exception.DoctorNotFoundException;
import com.example.mymed.mapper.DoctorMapper;
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

    public Doctor create(DoctorRequest request) {
        Doctor doctor = DoctorMapper.toEntity(request);
        return doctorRepository.save(doctor);
    }

    public Doctor getById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException(id));
    }

    public void delete(String id) {
        if (!doctorRepository.existsById(id)) {
            throw new DoctorNotFoundException(id);
        }
        doctorRepository.deleteById(id);
    }
}
