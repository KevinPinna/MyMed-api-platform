package com.example.mymed.controller;

import com.example.mymed.dto.AdminRequest;
import com.example.mymed.model.Admin;
import com.example.mymed.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    // Lista di tutti gli admin - solo ADMIN
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Admin> getAll() {
        return adminService.findAll();
    }

    // Dettaglio di un admin - solo ADMIN
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Admin getById(@PathVariable String id) {
        return adminService.findById(id);
    }

    // Crea un nuovo admin (e lo collega all'UserAccount con la stessa email)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Admin create(@Valid @RequestBody AdminRequest request) {
        return adminService.create(request);
    }

    // Aggiorna admin
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Admin update(@PathVariable String id,
                        @Valid @RequestBody AdminRequest request) {
        return adminService.update(id, request);
    }

    // Cancella admin
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        adminService.delete(id);
    }
}
