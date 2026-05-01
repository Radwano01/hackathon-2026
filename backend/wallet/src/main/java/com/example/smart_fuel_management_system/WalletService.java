package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.WalletBonusDTO;
import com.example.smart_fuel_management_system.dto.WalletDTO;
import com.example.smart_fuel_management_system.dto.WalletUpdateDTO;

import java.util.UUID;

/**
 * Wallet service with separated responsibilities:
 * - User operations: get wallet, update balance, deactivate
 * - Admin operations: activate, block wallets
 * - Internal operations: create, bonus, inter-service updates
 */
public interface WalletService {

    // ============== USER OPERATIONS ==============
    /**
     * Get authenticated user's wallet details
     */
    WalletDTO getWalletDetails(UUID userId);

    /**
     * User updates their own wallet balance (top-up, withdraw, refund)
     */
    void updateBalance(UUID userId, WalletUpdateDTO request);

    /**
     * User deactivates their own wallet
     */
    void deactivateWallet(UUID userId);


    // ============== ADMIN OPERATIONS ==============
    /**
     * Admin activates a deactivated wallet
     */
    void activateWallet(UUID userId);

    /**
     * Admin blocks a wallet (restricts all operations)
     */
    void blockWallet(UUID userId);


    // ============== INTERNAL OPERATIONS ==============
    /**
     * Service-to-service: Create wallet during user registration
     */
    void createWallet(UUID userId);

    /**
     * Service-to-service: Apply bonus/promotional credit
     */
    void applyBonus(WalletBonusDTO request);

    void deleteWallet(UUID userId);
}
