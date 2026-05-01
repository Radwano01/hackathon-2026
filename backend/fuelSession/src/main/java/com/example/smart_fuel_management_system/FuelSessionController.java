package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fuel-sessions/internal")
public class FuelSessionController {

    private final FuelSessionService fuelSessionService;

    public FuelSessionController(FuelSessionService fuelSessionService) {
        this.fuelSessionService = fuelSessionService;
    }

    @PostMapping("/start")
    public ResponseEntity<FuelSessionStartResponse> startSession(
            @RequestBody StartFuelSessionDTO request) {

        return ResponseEntity.ok(
                fuelSessionService.startSession(request)
        );
    }

    @PostMapping("/{sessionId}/stop")
    public ResponseEntity<FuelSessionDTO> stopSession(
            @PathVariable UUID sessionId,
            @RequestBody StopFuelSessionDTO request) {

        return ResponseEntity.ok(
                fuelSessionService.stopSession(sessionId, request)
        );
    }

    @PostMapping("/{sessionId}/cancel")
    public ResponseEntity<Void> cancelSession(
            @PathVariable UUID sessionId) {

        fuelSessionService.cancelSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<FuelSessionDTO> getById(
            @PathVariable UUID sessionId) {

        return ResponseEntity.ok(
                fuelSessionService.getSessionById(sessionId)
        );
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<FuelSessionDTO>> getByUser(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(
                fuelSessionService.getSessionsByUser(userId)
        );
    }
}