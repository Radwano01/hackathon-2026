package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.PaymentDTO;
import com.example.smart_fuel_management_system.dto.PaymentEligibilityResponse;
import com.example.smart_fuel_management_system.dto.PaymentResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentService {
    PaymentResponse pay(UUID userId, PaymentDTO request);

    PaymentEligibilityResponse checkEligibility(UUID userId, BigDecimal estimatedAmount);
}