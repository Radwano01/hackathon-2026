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
@Table(name = "PaymentPreference")
public class PaymentPreference {

    @Id
    private UUID userId;

    @Enumerated(EnumType.STRING)
    private PreferredType preferredType; // WALLET, CARD, AUTO

    private UUID preferredCardId; // nullable if wallet

}