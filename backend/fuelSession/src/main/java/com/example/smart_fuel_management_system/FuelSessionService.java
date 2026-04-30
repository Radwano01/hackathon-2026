package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.FuelSessionDTO;
import com.example.smart_fuel_management_system.dto.FuelSessionStartResponse;
import com.example.smart_fuel_management_system.dto.StartFuelSessionDTO;
import com.example.smart_fuel_management_system.dto.StopFuelSessionDTO;

import java.util.List;
import java.util.UUID;

public interface FuelSessionService {
    FuelSessionStartResponse startSession(StartFuelSessionDTO request);

    FuelSessionDTO stopSession(UUID sessionId, StopFuelSessionDTO request);

    FuelSessionDTO getSessionById(UUID sessionId);

    List<FuelSessionDTO> getSessionsByUser(UUID userId);

    void cancelSession(UUID sessionId);
}
