package com.example.mymed.mapper;

import com.example.mymed.dto.DoctorRequest;
import com.example.mymed.model.Doctor;

import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public class DoctorMapper {

    private DoctorMapper() {}

    public static Doctor toEntity(DoctorRequest request) {
        return Doctor.builder()
                .name(request.getName())
                .specialization(request.getSpecialization().name()) // salva codice
                .availabilityDays(
                        request.getAvailabilityDays() == null
                                ? new LinkedHashSet<>()
                                : request.getAvailabilityDays().stream()
                                .map(Enum::name)
                                .collect(Collectors.toCollection(LinkedHashSet::new))
                )
                .availabilityShift(request.getAvailabilityShift().name())
                .build();
    }

    /**
     * Normalizza eventuali valori vecchi salvati in ITA (es "Cardiologo"/"Cardiologia")
     * in un codice standard (es "CARDIOLOGY").
     */
    public static String normalizeSpecializationCode(String value) {
        if (value == null) return null;
        String raw = value.trim();
        if (raw.isEmpty()) return null;

        // già codice?
        String upper = raw.toUpperCase(Locale.ROOT);
        // se è uno dei tuoi enum, torna subito
        try {
            com.example.mymed.model.DoctorSpecialization.valueOf(upper);
            return upper;
        } catch (IllegalArgumentException ignored) {}

        String lower = raw.toLowerCase(Locale.ROOT);

        return switch (lower) {
            case "cardiologo", "cardiologia" -> "CARDIOLOGY";
            case "dermatologo", "dermatologia" -> "DERMATOLOGY";
            case "endocrinologo", "endocrinologia" -> "ENDOCRINOLOGY";
            case "gastroenterologo", "gastroenterologia" -> "GASTROENTEROLOGY";
            case "neurologo", "neurologia" -> "NEUROLOGY";
            case "ortopedico", "ortopedia" -> "ORTHOPEDICS";
            case "pediatra", "pediatria" -> "PEDIATRICS";
            case "psichiatra", "psichiatria" -> "PSYCHIATRY";
            case "radiologo", "radiologia" -> "RADIOLOGY";
            case "medico di base", "medicina generale", "medicina di base" -> "GENERAL_PRACTICE";
            default -> raw; // se non lo riconosco, non lo rompo
        };
    }
}
