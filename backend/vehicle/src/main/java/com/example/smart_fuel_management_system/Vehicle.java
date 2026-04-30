package com.example.smart_fuel_management_system;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    private UUID id = UUID.randomUUID();

    @Column(unique = true)
    private String plateNumber;

    private String brand;

    private String model;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    @Column(unique = true)
    private String rfidTag;

    @Enumerated(EnumType.STRING)
    private VehicleStatusType status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private UUID userId;

    public Vehicle(String plateNumber, String brand,
                   FuelType fuelType, String model,
                   String rfidTag, VehicleStatusType status,
                   UUID userId) {
        this.plateNumber = plateNumber;
        this.brand = brand;
        this.fuelType = fuelType;
        this.model = model;
        this.rfidTag = rfidTag;
        this.status = status;
        this.userId = userId;
    }
}
