package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.enums.FuelType;
import lombok.Builder;

import java.util.UUID;

@Builder
public record StartFuelSessionDTO(String plateNumber,
                                  String rfidTag,
                                  UUID stationId,
                                  UUID pumpId,
                                  FuelType fuelType) {
}
