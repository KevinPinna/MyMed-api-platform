package com.example.mymed.model;

public enum AppointmentStatus {
    SENDED,        // richiesta inviata dal paziente, in attesa conferma del dottore
    BOOKED,        // prenotata confermata dal dottore
    COMPLETED,     // effettuata
    CANCELED,      // annullata
    PENDING_PATIENT // in attesa di conferma da parte del paziente
}
