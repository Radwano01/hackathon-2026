package com.example.smart_fuel_management_system;

import java.math.BigDecimal;
import java.util.UUID;

public interface BonusService {
    void applyBonus(UUID userId, BigDecimal amount);
}