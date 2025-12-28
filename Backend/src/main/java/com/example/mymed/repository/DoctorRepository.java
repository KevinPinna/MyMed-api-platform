package com.example.mymed.repository;

import com.example.mymed.model.Doctor;
import com.example.mymed.model.DoctorSpecialization;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DoctorRepository extends MongoRepository<Doctor, String> {
    List<Doctor> findBySpecialization(DoctorSpecialization specialization);
}
