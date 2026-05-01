package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.PaymentMethodType;


import java.math.BigDecimal;
import java.util.UUID;

public record PaymentDTO(
        BigDecimal amount,
        UUID orderId
) {}