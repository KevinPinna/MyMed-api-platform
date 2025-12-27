package com.example.mymed.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document("patients")
public class Patient {

    @Id
    private String id;

    private String name;
    private String surname;
    private String email;
    private String phone;
}
