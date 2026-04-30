package com.example.smart_fuel_management_system;


import jakarta.persistence.*;
import jakarta.ws.rs.Encoded;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    private UUID id = UUID.randomUUID();

    private BigDecimal balance;

    private String currency;

    @Enumerated(EnumType.STRING)
    private StatusType statusType;

    private UUID userId;

    private LocalDateTime createdAt;

    public Wallet(BigDecimal balance, String currency, StatusType statusType,
                  UUID usedId, LocalDateTime createdAt) {
        this.balance = balance;
        this.currency = currency;
        this.statusType = statusType;
        this.userId = usedId;
        this.createdAt = createdAt;
    }

    public void credit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }

        this.balance = this.balance.add(amount);
    }

    public void debit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }

        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance");
        }

        this.balance = this.balance.subtract(amount);
    }
}
