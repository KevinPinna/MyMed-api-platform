package com.example.mymed.repository;

import com.example.mymed.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PatientRepository extends MongoRepository<Patient, String> {

    //Essendo che le mail DOVREBBERO essere uniche si puo ricercare per email
    Optional<Patient> findByEmail(String email);
}
