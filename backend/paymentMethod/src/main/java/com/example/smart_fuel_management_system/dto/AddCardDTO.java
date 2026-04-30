package com.example.smart_fuel_management_system.dto;

public record AddCardDTO(
        String cardHolderName,
        String cardNumber,
        String expiryDate
) {}