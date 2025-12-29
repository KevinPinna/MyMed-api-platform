package com.example.mymed.security;

import com.example.mymed.model.UserAccount;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserService {

    public UserAccount getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getPrincipal() == null || !(auth.getPrincipal() instanceof UserAccount)) {
            throw new IllegalStateException("Utente non autenticato o principal non valido");
        }

        return (UserAccount) auth.getPrincipal();
    }

    public boolean isAdmin() {
        UserAccount u = getCurrentUser();
        return u.getRole() != null && u.getRole().name().equals("ADMIN");
    }

    public boolean isDoctor() {
        UserAccount u = getCurrentUser();
        return u.getRole() != null && u.getRole().name().equals("DOCTOR");
    }

    public boolean isPatient() {
        UserAccount u = getCurrentUser();
        return u.getRole() != null && u.getRole().name().equals("PATIENT");
    }

    public String getCurrentDoctorId() {
        return getCurrentUser().getDoctorId();
    }

    public String getCurrentPatientId() {
        return getCurrentUser().getPatientId();
    }
}
