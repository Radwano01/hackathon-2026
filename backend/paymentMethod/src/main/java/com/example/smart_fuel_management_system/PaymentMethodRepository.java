package com.example.smart_fuel_management_system;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {

    List<PaymentMethod> findByUserId(UUID userId);

    PaymentMethod findByUserIdAndIsDefaultTrue(UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);

    boolean existsByCardNumberMasked(String cardNumberMasked);
}