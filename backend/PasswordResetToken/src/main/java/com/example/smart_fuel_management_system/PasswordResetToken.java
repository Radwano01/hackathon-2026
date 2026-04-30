package com.example.smart_fuel_management_system;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    private UUID id = UUID.randomUUID();

    private String token;

    private UUID userId;

    private LocalDateTime expireDate;
}
