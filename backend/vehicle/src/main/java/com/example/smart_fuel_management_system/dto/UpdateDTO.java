package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.FuelType;

public record UpdateDTO(String brand,
                        String model,
                        FuelType fuelType) {}
