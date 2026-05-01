package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.PaymentMethodType;

import java.util.UUID;

public record PaymentMethodPaymentDTO(
        UUID id,
        PaymentMethodType paymentMethodType,
        String cardToken,
        boolean isDefault
) {}