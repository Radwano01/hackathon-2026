package com.example.smart_fuel_management_system.dto;


import java.math.BigDecimal;
import java.util.UUID;

public record VisaAuthorizationDTO(
        UUID cardToken,
        BigDecimal amount,
        UUID transactionId
) {
}
