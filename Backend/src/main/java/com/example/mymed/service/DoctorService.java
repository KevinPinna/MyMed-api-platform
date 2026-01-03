package com.example.mymed.service;

import com.example.mymed.dto.DoctorPatchRequest;
import com.example.mymed.dto.DoctorRequest;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.mapper.DoctorMapper;
import com.example.mymed.model.Doctor;
import com.example.mymed.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    // ordine canonico dei giorni
    private static final List<String> DAY_ORDER = List.of(
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY"
    );

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> getAll(String specialization) {
        List<Doctor> list;

        if (specialization == null || specialization.isBlank()) {
            list = doctorRepository.findAll();
        } else {
            String specCode = DoctorMapper.normalizeSpecializationCode(specialization);
            list = doctorRepository.findBySpecialization(specCode);
        }

        // normalizzo specializzazione e ordino i giorni, se presenti
        list.forEach(d -> {
            d.setSpecialization(
                    DoctorMapper.normalizeSpecializationCode(d.getSpecialization())
            );
            if (d.getAvailabilityDays() != null && !d.getAvailabilityDays().isEmpty()) {
                d.setAvailabilityDays(sortAvailabilityDays(d.getAvailabilityDays()));
            }
        });

        return list;
    }

    public Doctor create(DoctorRequest request) {
        Doctor doctor = DoctorMapper.toEntity(request);

        // normalizzo specializzazione
        doctor.setSpecialization(
                DoctorMapper.normalizeSpecializationCode(doctor.getSpecialization())
        );

        // se arrivano già dei giorni, li normalizzo e ordino
        if (doctor.getAvailabilityDays() != null && !doctor.getAvailabilityDays().isEmpty()) {
            doctor.setAvailabilityDays(sortAvailabilityDays(doctor.getAvailabilityDays()));
        }

        return doctorRepository.save(doctor);
    }

    public Doctor getById(String id) {
        Doctor d = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dottore non trovato con id: " + id));

        d.setSpecialization(DoctorMapper.normalizeSpecializationCode(d.getSpecialization()));

        if (d.getAvailabilityDays() != null && !d.getAvailabilityDays().isEmpty()) {
            d.setAvailabilityDays(sortAvailabilityDays(d.getAvailabilityDays()));
        }

        return d;
    }

    public Doctor patch(String id, DoctorPatchRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dottore non trovato con id: " + id));

        // specializzazione
        if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
            doctor.setSpecialization(
                    DoctorMapper.normalizeSpecializationCode(request.getSpecialization())
            );
        }

        // giorni di disponibilità
        if (request.getAvailabilityDays() != null) {
            doctor.setAvailabilityDays(sortAvailabilityDays(request.getAvailabilityDays()));
        }

        // turno (MORNING / AFTERNOON / FULL_DAY )
        if (request.getAvailabilityShift() != null && !request.getAvailabilityShift().isBlank()) {
            doctor.setAvailabilityShift(request.getAvailabilityShift().trim().toUpperCase(Locale.ROOT));
        }

        Doctor saved = doctorRepository.save(doctor);

        // normalizzo output
        saved.setSpecialization(
                DoctorMapper.normalizeSpecializationCode(saved.getSpecialization())
        );
        if (saved.getAvailabilityDays() != null && !saved.getAvailabilityDays().isEmpty()) {
            saved.setAvailabilityDays(sortAvailabilityDays(saved.getAvailabilityDays()));
        }

        return saved;
    }

    public void delete(String id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Dottore non trovato con id: " + id);
        }
        doctorRepository.deleteById(id);
    }

    private LinkedHashSet<String> sortAvailabilityDays(Collection<String> days) {
        if (days == null) {
            return null;
        }

        return days.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(s -> s.toUpperCase(Locale.ROOT))
                .sorted(Comparator.comparingInt(d -> {
                    int idx = DAY_ORDER.indexOf(d);
                    return idx == -1 ? Integer.MAX_VALUE : idx; // giorni non validi in coda
                }))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
