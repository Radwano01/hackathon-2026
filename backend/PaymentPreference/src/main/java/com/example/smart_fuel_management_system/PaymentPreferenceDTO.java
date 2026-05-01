package com.example.smart_fuel_management_system;

import lombok.Builder;

import java.util.UUID;

@Builder
public record PaymentPreferenceDTO(
        UUID userId,
        PreferredType preferredType,
        UUID preferredCardId
) {}