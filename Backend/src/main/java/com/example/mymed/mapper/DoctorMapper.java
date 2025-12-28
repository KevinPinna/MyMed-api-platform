package com.example.mymed.mapper;

import com.example.mymed.dto.DoctorRequest;
import com.example.mymed.model.Doctor;

public class DoctorMapper {

    public static Doctor toEntity(DoctorRequest request) {
        return Doctor.builder()
                .name(request.getName())
                .specialization(request.getSpecialization())
                .availabilityDays(request.getAvailabilityDays())
                .availabilityShift(request.getAvailabilityShift())
                .build();
    }
}
