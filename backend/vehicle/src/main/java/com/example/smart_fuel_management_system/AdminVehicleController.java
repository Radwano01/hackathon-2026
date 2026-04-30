package com.example.smart_fuel_management_system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/vehicles")
public class AdminVehicleController {

    private final VehicleService vehicleService;

    public AdminVehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PatchMapping("/{vehicleId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID vehicleId,
            @RequestParam VehicleStatusType status) {

        vehicleService.updateStatus(vehicleId, status);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{plateNumber}/rfid")
    public ResponseEntity<Void> assignRfid(
            @PathVariable String plateNumber,
            @RequestParam String rfidTag) {

        vehicleService.assignRfid(plateNumber, rfidTag);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID vehicleId) {

        vehicleService.delete(vehicleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/plate/{plateNumber}")
    public ResponseEntity<Vehicle> findByPlate(
            @PathVariable String plateNumber) {

        return ResponseEntity.ok(
                vehicleService.findByPlateNumber(plateNumber)
        );
    }
}
