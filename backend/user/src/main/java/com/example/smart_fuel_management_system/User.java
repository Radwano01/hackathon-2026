package com.example.smart_fuel_management_system;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    private UUID id = UUID.randomUUID();

    private String fullName;

    @Column(unique = true, nullable = false)
    private String phoneNumber;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    public User(String fullName, String phoneNumber, String email, String password) {
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
    }
}
