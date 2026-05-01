package com.example.smart_fuel_management_system.dto;

public record UpdatePasswordDTO(
        String oldPassword,
        String newPassword
) {}
