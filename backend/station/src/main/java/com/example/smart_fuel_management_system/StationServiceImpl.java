package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.CreateStationDTO;
import com.example.smart_fuel_management_system.dto.StationDTO;
import com.example.smart_fuel_management_system.dto.StationResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;

    public StationServiceImpl(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @Override
    public UUID create(CreateStationDTO request) {

        Station station = new Station();
        station.setId(UUID.randomUUID());
        station.setName(request.name());
        station.setCity(request.city());
        station.setAddress(request.address());
        station.setPumpCount(request.pumpCount());
        station.setDieselPrice(request.dieselPrice());
        station.setRegularPrice(request.regularPrice());
        station.setPremiumPrice(request.premiumPrice());
        station.setAvailableFuelTypes(request.availableFuelTypes());
        station.setActive(true);
        station.setCreatedAt(LocalDateTime.now());

        return stationRepository.save(station).getId();
    }

    @Override
    public Station getById(UUID stationId) {
        return stationRepository.findById(stationId)
                .orElseThrow(() -> new EntityNotFoundException("Station not found"));
    }

    @Override
    public List<StationDTO> getAll() {
        return stationRepository.findAll().stream().map(this::map).toList();
    }

    @Override
    public List<StationDTO> getByCity(String city) {
        return stationRepository.findByCity(city).stream().map(this::map).toList();
    }

    @Override
    public void activate(UUID stationId) {
        Station station = getStation(stationId);
        station.setActive(true);
        stationRepository.save(station);
    }

    @Override
    public void deactivate(UUID stationId) {
        Station station = getStation(stationId);
        station.setActive(false);
        stationRepository.save(station);
    }

    @Override
    public BigDecimal getFuelPrice(UUID stationId, FuelType fuelType) {
        Station station = getStation(stationId);

        return switch (fuelType) {
            case DIESEL -> station.getDieselPrice();
            case REGULAR -> station.getRegularPrice();
            case PREMIUM -> station.getPremiumPrice();
            case ELECTRIC -> throw new IllegalArgumentException(
                    "ELECTRIC fuel is not supported by this station"
            );
        };
    }

    @Override
    public StationResponseDTO getInternalById(UUID id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found"));

        return StationResponseDTO.builder()
                .stationName(station.getName())
                .city(station.getCity())
                .build();

    }

    private Station getStation(UUID id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Station not found"));
    }

    private StationDTO map(Station s) {
        return new StationDTO(
                s.getId(),
                s.getName(),
                s.getCity(),
                s.getAddress(),
                s.isActive(),
                s.getPumpCount(),
                s.getAvailableFuelTypes(),
                s.getDieselPrice(),
                s.getRegularPrice(),
                s.getPremiumPrice()
        );
    }
}