package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.FuelType;

import java.math.BigDecimal;
import java.util.Set;

public record CreateStationDTO(
        String name,
        String city,
        String address,
        int pumpCount,
        BigDecimal dieselPrice,
        BigDecimal regularPrice,
        BigDecimal premiumPrice,
        Set<FuelType> availableFuelTypes
) {}