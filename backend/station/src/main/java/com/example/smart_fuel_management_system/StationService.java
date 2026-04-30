package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.CreateStationDTO;
import com.example.smart_fuel_management_system.dto.StationDTO;
import com.example.smart_fuel_management_system.dto.StationResponseDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface StationService {

    UUID create(CreateStationDTO request);

    Station getById(UUID stationId);

    List<StationDTO> getAll();

    List<StationDTO> getByCity(String city);

    void activate(UUID stationId);

    void deactivate(UUID stationId);

    BigDecimal getFuelPrice(UUID stationId, FuelType fuelType);

    StationResponseDTO getInternalById(UUID id);
}