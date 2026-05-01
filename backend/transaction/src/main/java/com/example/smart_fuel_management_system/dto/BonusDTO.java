package com.example.smart_fuel_management_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record BonusDTO(
        UUID userId,
        BigDecimal amount
) {}