package com.example.smart_fuel_management_system;

public record AddCardDTO(
        String cardHolderName,
        String cardNumber,
        String expiryDate
) {}