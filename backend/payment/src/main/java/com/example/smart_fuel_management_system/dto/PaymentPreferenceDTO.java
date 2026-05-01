package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.PreferredType;

import java.util.UUID;

public record PaymentPreferenceDTO(
        UUID userId,
        PreferredType preferredType,
        UUID preferredCardId
) {}