package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.FuelType;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

public record StationDTO(
        UUID id,
        String name,
        String city,
        String address,
        boolean active,
        int pumpCount,
        Set<FuelType> availableFuelTypes,
        BigDecimal dieselPrice,
        BigDecimal regularPrice,
        BigDecimal premiumPrice
) {}