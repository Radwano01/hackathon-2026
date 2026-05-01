package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.VehicleValidationDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    boolean existsByPlateNumber(String plateNumber);

    List<Vehicle> findAllByUserId(UUID userId);

    boolean existsByRfidTag(String rfidTag);

    Optional<Vehicle> findByPlateNumber(String plateNumber);

<<<<<<< HEAD
    Optional<Vehicle> findByUserIdAndVehicleId(UUID userId, UUID vehicleId);
=======
    Optional<Vehicle> findByUserIdAndId(UUID userId, UUID vehicleId);
>>>>>>> a114d8b (readme added)
    Optional<Vehicle> findByRfidTag(String rfidTag);
}