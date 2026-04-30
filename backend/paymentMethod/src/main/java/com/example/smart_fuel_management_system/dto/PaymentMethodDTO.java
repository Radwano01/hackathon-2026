package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.PaymentMethodType;

import java.util.UUID;

public record PaymentMethodDTO(
        UUID id,
        PaymentMethodType paymentMethodType,
        String cardHolderName,
        String maskedNumber,
        int priority,
        boolean isDefault
) {}