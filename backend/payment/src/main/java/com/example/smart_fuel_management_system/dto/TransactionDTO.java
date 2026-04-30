package com.example.smart_fuel_management_system.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record TransactionDTO(BigDecimal amount,
                             UUID stationId) {}