package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.enums.FuelType;
import com.example.smart_fuel_management_system.enums.VehicleStatusType;

import java.util.UUID;

public record VehicleValidationDTO(
        UUID id,
        VehicleStatusType status,
        FuelType fuelType
) {}