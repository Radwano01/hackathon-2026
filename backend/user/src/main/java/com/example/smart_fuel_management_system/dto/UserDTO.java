package com.example.smart_fuel_management_system.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record UserDTO(
        UUID id,
        String fullName,
        String phoneNumber,
        WalletDTO wallet
) {}
