package com.example.smart_fuel_management_system;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaymentPreferenceRepository
        extends JpaRepository<PaymentPreference, UUID> {
}