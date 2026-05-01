package com.example.smart_fuel_management_system.dto;

public record RegisterDTO(
        String fullName,
        String phoneNumber,
        String email,
        String password
) {}
