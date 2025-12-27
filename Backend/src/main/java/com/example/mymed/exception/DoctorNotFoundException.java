package com.example.mymed.exception;

//Gestione custom delle eccezioni per Doctor
public class DoctorNotFoundException extends RuntimeException {

    public DoctorNotFoundException(String id) {
        super("Doctor with id " + id + " not found");
    }
}
