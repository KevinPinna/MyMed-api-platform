// src/main/java/com/example/mymed/controller/AuthController.java
package com.example.mymed.controller;

import com.example.mymed.dto.AuthResponse;
import com.example.mymed.dto.LoginRequest;
import com.example.mymed.dto.PatientSelfRegisterRequest;
import com.example.mymed.dto.RegisterRequest;
import com.example.mymed.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    // Usato dall'admin per creare utenti (ADMIN/DOCTOR/PATIENT)
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // Self-registration paziente da frontend pubblico
    @PostMapping("/register/patient")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerPatient(@Valid @RequestBody PatientSelfRegisterRequest request) {
        return authService.registerPatient(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
