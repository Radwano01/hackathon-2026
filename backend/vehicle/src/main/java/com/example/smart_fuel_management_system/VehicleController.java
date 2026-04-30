package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<UUID> create(
            Authentication authentication,
            @RequestBody AddDTO request) {

        UUID userId = UUID.fromString(authentication.getName());

        UUID id = vehicleService.create(userId, request);
        return ResponseEntity.status(201).body(id);
    }

    @GetMapping
    public ResponseEntity<List<ListDTO>> list(Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());

        return ResponseEntity.ok(
                vehicleService.findAllByUserId(userId)
        );
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleDTO> getById(
            Authentication authentication,
            @PathVariable UUID vehicleId) {

        UUID userId = UUID.fromString(authentication.getName());

        return ResponseEntity.ok(
                vehicleService.findByUserIdAndVehicleId(userId, vehicleId)
        );
    }

    @PatchMapping("/{vehicleId}")
    public ResponseEntity<Void> update(
            Authentication authentication,
            @PathVariable UUID vehicleId,
            @RequestBody UpdateDTO request) {

        UUID userId = UUID.fromString(authentication.getName());

        vehicleService.update(userId, vehicleId, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{vehicleId}/deactivate")
    public ResponseEntity<Void> deactivate(
            Authentication authentication,
            @PathVariable UUID vehicleId) {

        UUID userId = UUID.fromString(authentication.getName());

        vehicleService.deactivate(userId, vehicleId);
        return ResponseEntity.noContent().build();
    }

    //admin page
    @GetMapping("/{vehicleId}/validate")
    public ResponseEntity<VehicleValidationDTO> validate(
            Authentication authentication,
            @PathVariable UUID vehicleId) {

        UUID userId = UUID.fromString(authentication.getName());

        return ResponseEntity.ok(
                vehicleService.validate(userId, vehicleId)
        );
    }

    @GetMapping("/internal/{userId}")
    public ResponseEntity<List<ListDTO>> internalListByUser(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(
                vehicleService.findAllByUserId(userId)
        );
    }

    @GetMapping("/internal/{userId}/validate")
    public ResponseEntity<VehicleValidationDTO> internalValidate(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(
                vehicleService.validateByUserId(userId)
        );
    }

    @GetMapping("/internal/resolve")
    public ResponseEntity<VehicleResponseDTO> internalResolve(
            @RequestParam String rfidTag,
            @RequestParam String plateNumber) {
        return ResponseEntity.ok(
                vehicleService.resolveVehicle(rfidTag, plateNumber)
        );
    }
}