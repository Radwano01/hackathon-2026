package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record TransactionResponse(UUID id,
                                  BigDecimal amount,
                                  TransactionType type) {}
