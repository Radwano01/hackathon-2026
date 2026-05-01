package com.example.smart_fuel_management_system;

import java.util.UUID;

public record PaymentMethodDTO(
        UUID id,
        PaymentMethodType paymentMethodType,
        String cardHolderName,
        String maskedNumber,
        int priority,
        boolean isDefault
) {}