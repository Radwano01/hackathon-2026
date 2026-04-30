package com.example.smart_fuel_management_system;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StationRepository extends JpaRepository<Station, UUID> {
    List<Station> findByCity(String city);
}