package com.example.smart_fuel_management_system.dto;

import lombok.Builder;

@Builder
public record StationResponseDTO(String stationName,
                                 String city) {
}
