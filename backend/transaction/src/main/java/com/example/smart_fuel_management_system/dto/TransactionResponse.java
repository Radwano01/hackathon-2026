package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.enums.FuelType;
import com.example.smart_fuel_management_system.enums.PaymentMethodType;
import com.example.smart_fuel_management_system.enums.TransactionStatusType;
import com.example.smart_fuel_management_system.enums.TransactionType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record TransactionResponse(
        UUID id,
        BigDecimal amount,
        TransactionType type,
        TransactionStatusType status,
        LocalDateTime createdAt,
        String stationName,
        String city,
        String vehiclePlateNumber,
        String brand,
        String model,
        FuelType fuelType,
        PaymentMethodType paymentMethodType,
        BigDecimal price,
        BigDecimal liter

) {}