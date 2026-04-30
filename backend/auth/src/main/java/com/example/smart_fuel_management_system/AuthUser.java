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
@Table(name = "auth")
public class AuthUser {

    @Id
    private UUID id = UUID.randomUUID();

    private String password;
    private String role;
}