package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.WalletBonusDTO;
import com.example.smart_fuel_management_system.dto.WalletDTO;
import com.example.smart_fuel_management_system.dto.WalletUpdateDTO;

import java.util.UUID;

public interface WalletService {
    void createWallet(UUID usedId);
    void deactivateWallet(UUID uuid);

    void activateWallet(UUID userId);

    // admin page access
    void blockWallet(UUID userId);

    WalletDTO getWalletDetails(UUID userId);

    void updateBalance(UUID userId, WalletUpdateDTO request);


    void applyBonus(WalletBonusDTO request);
}
