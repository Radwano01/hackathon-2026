package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.enums.PaymentMethodType;

public record PaymentEligibilityResponse(
        boolean eligible,
        PaymentMethodType method,
        String reason
) {}