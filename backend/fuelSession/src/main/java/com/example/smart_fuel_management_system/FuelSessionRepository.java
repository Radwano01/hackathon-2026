package com.example.smart_fuel_management_system;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FuelSessionRepository extends JpaRepository<FuelSession, UUID> {
    List<FuelSession> findAllByUserId(UUID userId);
}
