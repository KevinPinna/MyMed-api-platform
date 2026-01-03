package com.example.mymed.service;

import com.example.mymed.exception.ForbiddenException;
import com.example.mymed.exception.ResourceNotFoundException;
import com.example.mymed.model.Notification;
import com.example.mymed.model.UserAccount;
import com.example.mymed.repository.NotificationRepository;
import com.example.mymed.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    // usata internamente per creare una nuova notifica
    public Notification createNotification(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    // restituisce le notifiche dell'utente loggato
    public List<Notification> getMyNotifications() {
        UserAccount current = currentUserService.getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(current.getId());
    }

    // segna come letta una notifica
    public void markAsRead(String id) {
        UserAccount current = currentUserService.getCurrentUser();

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notifica non trovata con id: " + id));

        if (!notification.getUserId().equals(current.getId())) {
            throw new ForbiddenException("Non puoi modificare notifiche di altri utenti");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
}
