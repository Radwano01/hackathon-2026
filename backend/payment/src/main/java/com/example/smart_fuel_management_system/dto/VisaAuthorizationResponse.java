package com.example.smart_fuel_management_system.dto;

public record VisaAuthorizationResponse(
        boolean authorized,
        String authorizationCode,
        String message
) {
}