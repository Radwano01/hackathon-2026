package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.StationResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/internal/stations")
public class StationInternalController {

    private final StationService stationService;

    public StationInternalController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationResponseDTO> getStationInternalById(@PathVariable UUID id) {
        return ResponseEntity.ok(stationService.getInternalById(id));
    }
}
