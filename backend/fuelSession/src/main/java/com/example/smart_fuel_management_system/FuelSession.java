package com.example.smart_fuel_management_system;


import com.example.smart_fuel_management_system.enums.FuelStatusType;
import com.example.smart_fuel_management_system.enums.FuelType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "fuel_sessions")
public class FuelSession {

    @Id
    private UUID id = UUID.randomUUID();

    private UUID userId;
    private UUID vehicleId;
    private UUID stationId;
    private UUID transactionId;

    private BigDecimal liters;
    private BigDecimal totalCost;

    private FuelType fuelType;
    private FuelStatusType status; // STARTED, PROCESSING, COMPLETED

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    public FuelSession(UUID vehicleId, UUID userId, UUID stationId,
                       FuelType fuelType, FuelStatusType fuelStatusType) {
        this.vehicleId = vehicleId;
        this.userId = userId;
        this.stationId = stationId;
        this.fuelType = fuelType;
        this.status = fuelStatusType;
    }
}
