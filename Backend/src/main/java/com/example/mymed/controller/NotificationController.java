package com.example.mymed.controller;

import com.example.mymed.model.Notification;
import com.example.mymed.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // restituisce le notifiche dell'utente loggato
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public List<Notification> getMyNotifications() {
        return notificationService.getMyNotifications();
    }

    // segna come letta una notifica dell'utente loggato
    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public void markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
    }
}
