package com.example.mymed.service;

import com.example.mymed.dto.AuthResponse;
import com.example.mymed.dto.LoginRequest;
import com.example.mymed.dto.RegisterRequest;
import com.example.mymed.exception.BadRequestException;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.Doctor;
import com.example.mymed.model.Patient;
import com.example.mymed.model.Role;
import com.example.mymed.model.UserAccount;
import com.example.mymed.repository.DoctorRepository;
import com.example.mymed.repository.PatientRepository;
import com.example.mymed.repository.UserAccountRepository;
import com.example.mymed.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        //email unica
        if (userAccountRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email già registrata");
        }

        //converto stringa in enum Role
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Ruolo non valido. Valori ammessi: ADMIN, DOCTOR, PATIENT");
        }

        //regole di consistenza tra ruolo e doctorId/patientId
        if (role == Role.DOCTOR && (request.getDoctorId() == null || request.getDoctorId().isBlank())) {
            throw new BadRequestException("Per creare un utente DOCTOR è obbligatorio indicare doctorId");
        }
        if (role == Role.PATIENT && (request.getPatientId() == null || request.getPatientId().isBlank())) {
            throw new BadRequestException("Per creare un utente PATIENT è obbligatorio indicare patientId");
        }
        if (role == Role.ADMIN && (request.getDoctorId() != null || request.getPatientId() != null)) {
            throw new BadRequestException("Un utente ADMIN non deve avere doctorId/patientId associati");
        }

        String doctorId = null;
        String patientId = null;

        //se è un DOCTOR → verifico che il dottore esista e salvo l'id
        if (role == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Dottore non trovato con id: " + request.getDoctorId()
                    ));
            doctorId = doctor.getId();
        }

        //se è un PATIENT → verifico che il paziente esista e salvo l'id
        if (role == Role.PATIENT) {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Paziente non trovato con id: " + request.getPatientId()
                    ));
            patientId = patient.getId();
        }

        //creo l'utente applicativo
        UserAccount user = UserAccount.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .doctorId(doctorId)
                .patientId(patientId)
                .createdAt(LocalDateTime.now())
                .build();

        userAccountRepository.save(user);

        //genero JWT
        String token = jwtService.generateToken(user);

        //risposta con info di collegamento
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .doctorId(user.getDoctorId())
                .patientId(user.getPatientId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        //autentico credenziali (se fallisce → eccezione 401 gestita da Spring Security)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        //recupero l'utente dal DB
        UserAccount user = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utente non trovato con email: " + request.getEmail()
                ));

        //genero nuovo JWT
        String token = jwtService.generateToken(user);

        //ritorno anche doctorId/patientId
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .doctorId(user.getDoctorId())
                .patientId(user.getPatientId())
                .build();
    }
}
