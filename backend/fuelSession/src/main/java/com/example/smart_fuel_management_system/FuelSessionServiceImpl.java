package com.example.smart_fuel_management_system;


import com.example.smart_fuel_management_system.dto.*;
import com.example.smart_fuel_management_system.enums.FuelStatusType;
import com.example.smart_fuel_management_system.enums.PaymentStatusType;
import com.example.smart_fuel_management_system.enums.VehicleStatusType;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FuelSessionServiceImpl implements FuelSessionService {

    private final FuelSessionRepository fuelSessionRepository;

    private final RestTemplate restTemplate;

    @Autowired
    public FuelSessionServiceImpl(FuelSessionRepository fuelSessionRepository,
                                  RestTemplate restTemplate) {
        this.fuelSessionRepository = fuelSessionRepository;
        this.restTemplate = restTemplate;
    }


    @Override
    public FuelSessionStartResponse startSession(StartFuelSessionDTO request) {

        VehicleResponseDTO vehicle = restTemplate.getForObject(
                "http://VEHICLE/api/v1/vehicles/internal/resolve?rfidTag={rfidTag}&plateNumber={plateNumber}",
                VehicleResponseDTO.class,
                request.rfidTag(),
                request.plateNumber()
        );

        if (vehicle == null) {
            throw new IllegalStateException("Vehicle not found");
        }

        PaymentEligibilityResponse eligibility = restTemplate.getForObject(
                "http://PAYMENT/internal/payments/users/{userId}/eligibility?estimatedAmount=500",
                PaymentEligibilityResponse.class,
                vehicle.userId()
        );

        if (eligibility == null || !eligibility.eligible()) {
            throw new IllegalStateException(
                    "Payment not allowed: " + (eligibility != null ? eligibility.reason() : "unknown")
            );
        }

        FuelSession session = new FuelSession(
                vehicle.vehicleId(),
                vehicle.userId(),
                request.stationId(),
                request.fuelType(),
                FuelStatusType.STARTED
        );

        FuelSession saved = fuelSessionRepository.save(session);

        return new FuelSessionStartResponse(
                saved.getId(),
                saved.getStatus(),
                true
        );
    }

    @Override
    @Transactional
    public FuelSessionDTO stopSession(UUID sessionId, StopFuelSessionDTO request) {

        FuelSession session = fuelSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Session not found"));

        if (session.getStatus() != FuelStatusType.STARTED) {
            throw new IllegalStateException("Session is not active");
        }

        // 1. calculate cost
        BigDecimal liters = request.liters();
        BigDecimal totalCost = liters.multiply(request.pricePerLiter());

        session.setLiters(liters);
        session.setTotalCost(totalCost);

        // 2. call PAYMENT SERVICE
        PaymentResponse payment = restTemplate.postForObject(
                "http://PAYMENT/api/v1/payments/users/{userId}",
                new PaymentDTO(totalCost, session.getId()),
                PaymentResponse.class,
                session.getUserId()
        );

        if (payment == null || payment.status() != PaymentStatusType.SUCCESS) {
            throw new IllegalStateException("Payment failed");
        }

        // 3. finalize session
        session.setTransactionId(payment.transactionId());
        session.setStatus(FuelStatusType.COMPLETED);
        session.setEndedAt(LocalDateTime.now());

        FuelSession saved = fuelSessionRepository.save(session);

        return FuelSessionDTO.builder()
                .sessionId(saved.getId())
                .vehicleId(saved.getVehicleId())
                .stationId(saved.getStationId())
                .transactionId(saved.getTransactionId())
                .fuelType(saved.getFuelType())
                .liters(saved.getLiters())
                .totalCost(saved.getTotalCost())
                .status(saved.getStatus())
                .startedAt(saved.getStartedAt())
                .endedAt(saved.getEndedAt())
                .build();
    }

    @Override
    public FuelSessionDTO getSessionById(UUID sessionId) {

        FuelSession session = fuelSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Fuel session not found"));

        return FuelSessionDTO.builder()
                .sessionId(session.getId())
                .vehicleId(session.getVehicleId())
                .stationId(session.getStationId())
                .transactionId(session.getTransactionId())
                .fuelType(session.getFuelType())
                .liters(session.getLiters())
                .totalCost(session.getTotalCost())
                .status(session.getStatus())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .build();
    }

    @Override
    public List<FuelSessionDTO> getSessionsByUser(UUID userId) {

        List<FuelSession> sessions = fuelSessionRepository.findAllByUserId(userId);

        return sessions.stream()
                .map(session -> FuelSessionDTO.builder()
                        .sessionId(session.getId())
                        .vehicleId(session.getVehicleId())
                        .stationId(session.getStationId())
                        .transactionId(session.getTransactionId())
                        .fuelType(session.getFuelType())
                        .liters(session.getLiters())
                        .totalCost(session.getTotalCost())
                        .status(session.getStatus())
                        .startedAt(session.getStartedAt())
                        .endedAt(session.getEndedAt())
                        .build()
                )
                .toList();
    }

    @Override
    @Transactional
    public void cancelSession(UUID sessionId) {

        FuelSession session = fuelSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Fuel session not found"));

        if (session.getStatus() == FuelStatusType.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed session");
        }

        if (session.getStatus() == FuelStatusType.CANCELLED) {
            throw new IllegalStateException("Session is already cancelled");
        }

        session.setStatus(FuelStatusType.CANCELLED);
        session.setEndedAt(LocalDateTime.now());

        fuelSessionRepository.save(session);
    }

    private FuelSession getSession(StartFuelSessionDTO request, VehicleValidationDTO vehicleValidation, VehicleResponseDTO vehicle) {
        if (vehicleValidation == null ||
                vehicleValidation.status() != VehicleStatusType.ACTIVE) {
            throw new IllegalStateException("Vehicle not allowed to start session");
        }

        UUID userId = vehicle.userId();
        UUID vehicleId = vehicle.vehicleId();

        return new FuelSession(
                vehicleId,
                userId,
                request.stationId(),
                request.fuelType(),
                FuelStatusType.STARTED
        );
    }
}
