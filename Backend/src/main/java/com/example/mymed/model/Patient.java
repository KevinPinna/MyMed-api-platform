// src/main/java/com/example/mymed/model/Patient.java
package com.example.mymed.model;

import jdk.jshell.Snippet;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document("patients")
public class Patient {

    @Id
    private String id;

    private String name;
    private String surname;
    private String email;
    private String phone;

    private String fiscalCode;

}
