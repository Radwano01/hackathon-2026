package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.ListDTO;
import com.example.smart_fuel_management_system.dto.VehicleResponseDTO;
import com.example.smart_fuel_management_system.dto.VehicleValidationDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vehicles/internal")
public class InternalVehicleController {

    private final VehicleService vehicleService;

    public InternalVehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ListDTO>> internalListByUser(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(
                vehicleService.findAllByUserId(userId)
        );
    }

    @GetMapping("/{userId}/validate")
    public ResponseEntity<VehicleValidationDTO> internalValidate(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(
                vehicleService.validateByUserId(userId)
        );
    }

    @GetMapping("/resolve")
    public ResponseEntity<VehicleResponseDTO> internalResolve(
            @RequestParam String rfidTag,
            @RequestParam String plateNumber) {
        return ResponseEntity.ok(
                vehicleService.resolveVehicle(rfidTag, plateNumber)
        );
    }
}
