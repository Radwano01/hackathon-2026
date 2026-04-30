package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.PaymentDTO;
import com.example.smart_fuel_management_system.dto.PaymentResponse;

import java.util.UUID;

public interface PaymentService {
    PaymentResponse pay(UUID userId, PaymentDTO request);
}