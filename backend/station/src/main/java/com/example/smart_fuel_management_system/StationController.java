package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.CreateStationDTO;
import com.example.smart_fuel_management_system.dto.StationDTO;
import com.example.smart_fuel_management_system.dto.StationResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stations")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }
    public ResponseEntity<List<StationDTO>> getAll() {
        return ResponseEntity.ok(stationService.getAll());
    }


    @GetMapping("/{id}")
    public ResponseEntity<Station> getStationById(@PathVariable UUID id) {
        return ResponseEntity.ok(stationService.getById(id));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<StationDTO>> getByCity(@PathVariable String city) {
        return ResponseEntity.ok(stationService.getByCity(city));
    }

    @GetMapping("/{id}/price")
    public ResponseEntity<BigDecimal> getPrice(
            @PathVariable UUID id,
            @RequestParam FuelType type
    ) {
        return ResponseEntity.ok(stationService.getFuelPrice(id, type));
    }
}