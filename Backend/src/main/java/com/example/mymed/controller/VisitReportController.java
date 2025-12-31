// src/main/java/com/example/mymed/controller/VisitReportController.java
package com.example.mymed.controller;

import com.example.mymed.dto.VisitReportRequest;
import com.example.mymed.model.VisitReport;
import com.example.mymed.service.VisitReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visit-reports")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class VisitReportController {

    private final VisitReportService visitReportService;

    // crea / aggiorna referto per un appuntamento
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public VisitReport createOrUpdate(@Valid @RequestBody VisitReportRequest request) {
        return visitReportService.createOrUpdate(request);
    }

    // recupera referto a partire dall'appuntamento
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public VisitReport getByAppointment(@PathVariable String appointmentId) {
        return visitReportService.getByAppointment(appointmentId);
    }

    // recupera referto per id
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public VisitReport getById(@PathVariable String id) {
        return visitReportService.getById(id);
    }

    //Lista referti con filtri doctorId / patientId
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public List<VisitReport> search(
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) String patientId
    ) {
        return visitReportService.search(doctorId, patientId);
    }
}
