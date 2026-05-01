package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.AddCardDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodPaymentDTO;

import java.util.List;
import java.util.UUID;

public interface PaymentMethodService {

    void addCard(UUID userId, AddCardDTO dto);

    List<PaymentMethodDTO> list(UUID userId);

    List<PaymentMethodPaymentDTO> internalList(UUID userId);

    void delete(UUID userId, UUID methodId);

    void setDefault(UUID userId, UUID methodId);
}