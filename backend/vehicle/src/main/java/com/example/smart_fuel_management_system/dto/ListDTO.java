package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.VehicleStatusType;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ListDTO(UUID id,
                      String brand,
                      String model,
                      VehicleStatusType status) {

}
