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

    private UUID cardToken;

    private boolean isDefault;

    private int priority; // 1- wallet, 2- selected visa

    public PaymentMethod(UUID userId, PaymentMethodType paymentMethodType,
                         String cardHolderName, UUID cardToken, String mask, String expireDate) {
        this.userId = userId;
        this.type = paymentMethodType;
        this.cardHolderName = cardHolderName;
        this.cardToken = cardToken;
        this.cardNumberMasked = mask;
        this.expiryDate = expireDate;
    }

}