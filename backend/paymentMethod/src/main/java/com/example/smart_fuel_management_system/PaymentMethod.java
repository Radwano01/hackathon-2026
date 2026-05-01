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
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID userId;

    @Enumerated(EnumType.STRING)
    private PaymentMethodType type;

    private String cardHolderName;
    private String cardNumberMasked; // NEVER store full card
    private String expiryDate;

    private String cardToken;

    private boolean isDefault;

    public PaymentMethod(UUID userId,
                         PaymentMethodType type,
                         String cardHolderName,
                         String cardToken,
                         String cardNumberMasked,
                         String expiryDate) {
        this.userId = userId;
        this.type = type;
        this.cardHolderName = cardHolderName;
        this.cardToken = cardToken;
        this.cardNumberMasked = cardNumberMasked;
        this.expiryDate = expiryDate;
    }
}