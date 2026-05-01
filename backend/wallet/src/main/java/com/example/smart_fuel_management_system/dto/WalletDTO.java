package com.example.smart_fuel_management_system.dto;

import com.example.smart_fuel_management_system.StatusType;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record WalletDTO(BigDecimal balance,
                        String currency,
                        StatusType statusType) {
}
