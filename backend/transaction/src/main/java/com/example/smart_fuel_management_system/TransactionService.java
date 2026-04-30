package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.TransactionDTO;
import com.example.smart_fuel_management_system.dto.TransactionResponse;
import com.example.smart_fuel_management_system.enums.TransactionStatusType;

import java.util.List;
import java.util.UUID;

public interface TransactionService {
    TransactionResponse create(UUID userId, TransactionDTO transactionDTO);

    void update(UUID transactionId, TransactionStatusType transactionStatusType);

    List<TransactionResponse> getByUserId(UUID UserId);

    TransactionResponse getById(UUID transactionId);
}
