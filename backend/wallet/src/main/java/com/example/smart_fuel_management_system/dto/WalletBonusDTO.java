package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.TransactionType;

import java.math.BigDecimal;
import java.util.UUID;

public record WalletBonusDTO(
        UUID userId,
        BigDecimal amount
) {}