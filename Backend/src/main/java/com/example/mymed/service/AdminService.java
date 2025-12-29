package com.example.mymed.service;

import com.example.mymed.dto.AdminRequest;
import com.example.mymed.exception.BadRequestException;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.Admin;
import com.example.mymed.model.Role;
import com.example.mymed.model.UserAccount;
import com.example.mymed.repository.AdminRepository;
import com.example.mymed.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserAccountRepository userAccountRepository;

    public List<Admin> findAll() {
        return adminRepository.findAll();
    }

    public Admin findById(String id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin non trovato con id: " + id));
    }

    /**
     * Crea un nuovo Admin e lo collega all'utente con stessa email e ruolo ADMIN (se esiste).
     */
    public Admin create(AdminRequest request) {

        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Esiste già un admin con questa email");
        }

        // cerco l'utente con questa email
        UserAccount user = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException(
                        "Non esiste un utente registrato con questa email. " +
                                "Crea prima l'account (role=ADMIN) tramite /api/auth/register")
                );

        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException("L'utente trovato non ha ruolo ADMIN");
        }

        LocalDateTime now = LocalDateTime.now();

        Admin admin = Admin.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .phone(request.getPhone())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Admin saved = adminRepository.save(admin);

        // collego il profilo admin all'utente
        user.setAdminId(saved.getId());
        userAccountRepository.save(user);

        return saved;
    }

    public Admin update(String id, AdminRequest request) {
        Admin existing = findById(id);

        existing.setName(request.getName());
        existing.setSurname(request.getSurname());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setUpdatedAt(LocalDateTime.now());

        return adminRepository.save(existing);
    }

    public void delete(String id) {
        Admin admin = findById(id);

        // scollego eventuale utente
        userAccountRepository.findByEmail(admin.getEmail()).ifPresent(user -> {
            if (id.equals(user.getAdminId())) {
                user.setAdminId(null);
                userAccountRepository.save(user);
            }
        });

        adminRepository.deleteById(id);
    }
}
