package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.CreateStationDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/stations")
public class AdminStationController {

    private final StationService stationService;

    public AdminStationController(StationService stationService) {
        this.stationService = stationService;
    }

    @PostMapping
    public ResponseEntity<UUID> create(@RequestBody CreateStationDTO request) {
        return ResponseEntity.status(201).body(stationService.create(request));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable UUID id) {
        stationService.activate(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        stationService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
