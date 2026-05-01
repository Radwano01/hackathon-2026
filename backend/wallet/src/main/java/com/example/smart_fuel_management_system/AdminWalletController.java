package com.example.smart_fuel_management_system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Admin Wallet API - Administrative wallet management
 * Base path: /api/v1/admin/wallet
 * Requires: Valid JWT token with ADMIN role
 */
@RestController
@RequestMapping("/api/v1/admin/wallet")
public class AdminWalletController {

    private final WalletService walletService;

    public AdminWalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Admin activates a deactivated wallet back to active state
     * PATCH /api/v1/admin/wallet/{userId}/activate
     * Precondition: Wallet must be in INACTIVE state
     */
    @PatchMapping("/{userId}/activate")
    public ResponseEntity<Void> activateWallet(@PathVariable UUID userId) {
        walletService.activateWallet(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Admin blocks a wallet (restricts all operations on it)
     * PATCH /api/v1/admin/wallet/{userId}/block
     */
    @PatchMapping("/{userId}/block")
    public ResponseEntity<Void> blockWallet(@PathVariable UUID userId) {
        walletService.blockWallet(userId);
        return ResponseEntity.noContent().build();
    }
}
