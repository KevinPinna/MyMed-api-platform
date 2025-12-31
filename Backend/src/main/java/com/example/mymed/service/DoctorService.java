package com.example.mymed.service;

import com.example.mymed.dto.DoctorPatchRequest;
import com.example.mymed.dto.DoctorRequest;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.mapper.DoctorMapper;
import com.example.mymed.model.Doctor;
import com.example.mymed.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> getAll(String specialization) {
        List<Doctor> list;

        if (specialization == null || specialization.isBlank()) {
            list = doctorRepository.findAll();
        } else {
            // normalizzo
            String specCode = DoctorMapper.normalizeSpecializationCode(specialization);
            list = doctorRepository.findBySpecialization(specCode);
        }

        list.forEach(d ->
                d.setSpecialization(DoctorMapper.normalizeSpecializationCode(d.getSpecialization()))
        );

        return list;
    }

    public Doctor create(DoctorRequest request) {
        Doctor doctor = DoctorMapper.toEntity(request);

        // specialization nel model è String -> normalizzo
        doctor.setSpecialization(
                DoctorMapper.normalizeSpecializationCode(doctor.getSpecialization())
        );

        return doctorRepository.save(doctor);
    }

    public Doctor getById(String id) {
        Doctor d = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dottore non trovato con id: " + id));

        d.setSpecialization(DoctorMapper.normalizeSpecializationCode(d.getSpecialization()));
        return d;
    }

    public Doctor patch(String id, DoctorPatchRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dottore non trovato con id: " + id));

        if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
            doctor.setSpecialization(
                    DoctorMapper.normalizeSpecializationCode(request.getSpecialization())
            );
        }

        if (request.getAvailabilityDays() != null) {
            //giorni -> UPPERCASE, senza spazi
            Set<String> normalizedDays = request.getAvailabilityDays().stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .map(s -> s.toUpperCase(Locale.ROOT))
                    .collect(Collectors.toSet());

            doctor.setAvailabilityDays(normalizedDays);
        }

        if (request.getAvailabilityShift() != null && !request.getAvailabilityShift().isBlank()) {
            doctor.setAvailabilityShift(request.getAvailabilityShift().trim().toUpperCase(Locale.ROOT));
        }

        Doctor saved = doctorRepository.save(doctor);

        //output
        saved.setSpecialization(DoctorMapper.normalizeSpecializationCode(saved.getSpecialization()));
        return saved;
    }

    public void delete(String id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Dottore non trovato con id: " + id);
        }
        doctorRepository.deleteById(id);
    }
}
