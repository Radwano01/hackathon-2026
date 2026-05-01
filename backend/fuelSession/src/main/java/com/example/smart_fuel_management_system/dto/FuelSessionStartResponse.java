package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.enums.FuelStatusType;
import lombok.Builder;

import java.util.UUID;

@Builder
public record FuelSessionStartResponse(
        UUID sessionId,
        FuelStatusType status,
        boolean allowed
) {}