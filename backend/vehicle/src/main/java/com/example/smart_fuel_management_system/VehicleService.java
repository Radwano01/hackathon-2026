package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;

import java.util.List;
import java.util.UUID;

public interface VehicleService {

    // =========================
    // USER SCOPED OPERATIONS
    // =========================

    UUID create(UUID userId, AddDTO addDTO);

    List<ListDTO> findAllByUserId(UUID userId);

    VehicleDTO findByUserIdAndVehicleId(UUID userId, UUID vehicleId);

    void update(UUID userId, UUID vehicleId, UpdateDTO updateDTO);

    void deactivate(UUID userId, UUID vehicleId);

    VehicleValidationDTO validate(UUID userId, UUID vehicleId);


    // =========================
    // ADMIN / GLOBAL OPERATIONS
    // =========================

    void assignRfid(String plateNumber, String rfidTag);

    void updateStatus(UUID vehicleId, VehicleStatusType status);

    void delete(UUID vehicleId);

    Vehicle findByPlateNumber(String plateNumber);

    Vehicle findByRfid(String rfidTag);
    VehicleValidationDTO validateByUserId(UUID userId);
    VehicleResponseDTO resolveVehicle(String rfidTag, String plateNumber);
}