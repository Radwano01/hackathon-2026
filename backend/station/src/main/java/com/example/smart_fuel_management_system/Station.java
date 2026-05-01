package com.example.smart_fuel_management_system;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "stations")
public class Station {

    @Id
    private UUID id;

    private String name;
    private String city;
    private String address;

    private boolean active;

    private int pumpCount;

    private BigDecimal dieselPrice;
    private BigDecimal regularPrice;
    private BigDecimal premiumPrice;

    private LocalDateTime createdAt;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private Set<FuelType> availableFuelTypes;
}