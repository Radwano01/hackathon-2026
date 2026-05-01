package com.example.smart_fuel_management_system.dto;

import java.util.UUID;

public record AuthDTO(
        String token,
        String refreshToken
) {}