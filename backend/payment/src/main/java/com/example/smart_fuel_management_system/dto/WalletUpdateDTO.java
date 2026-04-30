package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.TransactionType;

import java.math.BigDecimal;

public record WalletUpdateDTO(
        BigDecimal amount,
        TransactionType type
) {}