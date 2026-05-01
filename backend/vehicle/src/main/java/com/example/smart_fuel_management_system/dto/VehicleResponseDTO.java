package com.example.smart_fuel_management_system.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record VehicleResponseDTO(UUID userId,
                                 UUID vehicleId) {
}
