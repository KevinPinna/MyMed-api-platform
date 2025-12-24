package dev.kevin.mymed.repository;

import dev.kevin.mymed.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DoctorRepository extends MongoRepository<Doctor, String> {
}
