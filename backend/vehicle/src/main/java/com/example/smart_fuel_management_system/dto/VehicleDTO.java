package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.FuelType;
import com.example.smart_fuel_management_system.VehicleStatusType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record VehicleDTO(UUID id,
                         String plateNumber,
                         String brand,
                         String model,
                         FuelType fuelType,
                         VehicleStatusType status,
                         LocalDateTime createdAt,
                         LocalDateTime updatedAt) {}
