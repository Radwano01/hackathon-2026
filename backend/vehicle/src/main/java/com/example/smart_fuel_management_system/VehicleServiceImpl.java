package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Autowired
    public VehicleServiceImpl(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public UUID create(UUID userId, AddDTO addDTO) {

        if (vehicleRepository.existsByPlateNumber(addDTO.plateNumber())) {
            throw new EntityExistsException("Vehicle with this plate number already exists");
        }

        Vehicle vehicle = new Vehicle(
                addDTO.plateNumber(),
                addDTO.brand(),
                addDTO.fuelType(),
                addDTO.model(),
                null,
                VehicleStatusType.ACTIVE,
                userId
        );

        vehicleRepository.save(vehicle);
        return vehicle.getId();
    }

    @Override
    public List<ListDTO> findAllByUserId(UUID userId) {

        return vehicleRepository.findAllByUserId(userId)
                .stream()
                .map(v -> ListDTO.builder()
                        .id(v.getId())
                        .brand(v.getBrand())
                        .model(v.getModel())
                        .status(v.getStatus())
                        .build()
                )
                .toList();
    }

    @Override
    public VehicleDTO findByUserIdAndVehicleId(UUID userId, UUID vehicleId) {

        Vehicle vehicle = vehicleRepository
                .findByUserIdAndId(userId, vehicleId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vehicle not found for this user"
                ));

        return VehicleDTO.builder()
                .id(vehicle.getId())
                .plateNumber(vehicle.getPlateNumber())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .fuelType(vehicle.getFuelType())
                .status(vehicle.getStatus())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void update(UUID userId, UUID vehicleId, UpdateDTO updateDTO) {

        Vehicle vehicle = vehicleRepository
                .findByUserIdAndId(userId, vehicleId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vehicle not found for this user"
                ));

        boolean changed = false;

        if (updateDTO.brand() != null) {
            vehicle.setBrand(updateDTO.brand());
            changed = true;
        }

        if (updateDTO.model() != null) {
            vehicle.setModel(updateDTO.model());
            changed = true;
        }

        if (updateDTO.fuelType() != null) {
            vehicle.setFuelType(updateDTO.fuelType());
            changed = true;
        }

        if (changed) {
            vehicle.setUpdatedAt(LocalDateTime.now());
            vehicleRepository.save(vehicle);
        }
    }

    @Override
    @Transactional
    public void deactivate(UUID userId, UUID vehicleId) {

        Vehicle vehicle = vehicleRepository
                .findByUserIdAndId(userId, vehicleId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vehicle not found for this user"
                ));

        vehicle.setStatus(VehicleStatusType.INACTIVE);
        vehicle.setUpdatedAt(LocalDateTime.now());

        vehicleRepository.save(vehicle);
    }

    @Override
    public void assignRfid(String plateNumber, String rfidTag) {

        if (vehicleRepository.existsByRfidTag(rfidTag)) {
            throw new EntityExistsException("RFID already assigned to another vehicle");
        }

        Vehicle vehicle = findVehicleByPlateNumber(plateNumber);

        if (vehicle.getRfidTag() != null) {
            throw new IllegalStateException("Vehicle already has an RFID assigned");
        }

        vehicle.setRfidTag(rfidTag);
        vehicle.setStatus(VehicleStatusType.ACTIVE);
        vehicle.setUpdatedAt(LocalDateTime.now());

        vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public void updateStatus(UUID vehicleId, VehicleStatusType status) {

        Vehicle vehicle = findVehicleById(vehicleId);

        vehicle.setStatus(status);
        vehicle.setUpdatedAt(LocalDateTime.now());

        vehicleRepository.save(vehicle);
    }

    @Override
    public void delete(UUID vehicleId) {
        vehicleRepository.deleteById(vehicleId);
    }

    @Override
    public Vehicle findByPlateNumber(String plateNumber) {
        return findVehicleByPlateNumber(plateNumber);
    }

    @Override
    public Vehicle findByRfid(String rfidTag) {
        return vehicleRepository.findByRfidTag(rfidTag)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with RFID: " + rfidTag));
    }

    @Override
    public VehicleValidationDTO validate(UUID userId, UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findByUserIdAndId(userId, vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("this user does not have such this car"));

        return VehicleValidationDTO.builder()
                .id(vehicle.getId())
                .status(vehicle.getStatus())
                .fuelType(vehicle.getFuelType())
                .build();
    }

    private Vehicle findVehicleById(UUID id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vehicle does not exist"
                ));
    }

    private Vehicle findVehicleByPlateNumber(String plateNumber) {
        return vehicleRepository.findByPlateNumber(plateNumber)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Vehicle not found"
                ));
    }

    @Override
    public VehicleValidationDTO validateByUserId(UUID userId) {
        Vehicle vehicle = vehicleRepository.findAllByUserId(userId)
                .stream()
                .filter(v -> v.getStatus() == VehicleStatusType.ACTIVE)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("No active vehicle found for this user"));

        return VehicleValidationDTO.builder()
                .id(vehicle.getId())
                .status(vehicle.getStatus())
                .fuelType(vehicle.getFuelType())
                .build();
    }

    @Override
    public VehicleResponseDTO resolveVehicle(String rfidTag, String plateNumber) {
        Vehicle vehicle = vehicleRepository.findByRfidTag(rfidTag)
                .orElseGet(() -> vehicleRepository.findByPlateNumber(plateNumber)
                        .orElseThrow(() -> new EntityNotFoundException("Vehicle not found")));

        return VehicleResponseDTO.builder()
                .vehicleId(vehicle.getId())
                .userId(vehicle.getUserId())
                .build();
    }
}