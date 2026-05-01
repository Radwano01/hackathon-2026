package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.WalletBonusDTO;
import com.example.smart_fuel_management_system.dto.WalletDTO;
import com.example.smart_fuel_management_system.dto.WalletUpdateDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Internal Wallet API - Service-to-service communication
 * Base path: /internal/wallet
 * No authentication required - for internal Eureka service calls only
 */
@RestController
@RequestMapping("/internal/wallet")
public class InternalWalletController {

    private final WalletService walletService;

    public InternalWalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Create wallet during user registration
     * POST /internal/wallet/{userId}
     */
    @PostMapping("/{userId}")
    public ResponseEntity<Void> createWallet(@PathVariable UUID userId) {
        walletService.createWallet(userId);
        return ResponseEntity.status(201).build();
    }

    /**
     * Get wallet details by user ID
     * GET /internal/wallet/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<WalletDTO> getWallet(@PathVariable UUID userId) {
        return ResponseEntity.ok(walletService.getWalletDetails(userId));
    }

    /**
     * Update wallet balance by user ID (internal only)
     * POST /internal/wallet/{userId}/update
     * Body: { "amount": 100, "type": "TOP_UP|WITHDRAW|REFUND|BONUS" }
     */
    @PostMapping("/{userId}/update")
    public ResponseEntity<Void> updateBalance(
            @PathVariable UUID userId,
            @RequestBody WalletUpdateDTO request) {
        walletService.updateBalance(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Apply bonus/promotional credit to user's wallet
     * POST /internal/wallet/bonus
     * Body: { "userId": "...", "amount": 50 }
     */
    @PostMapping("/bonus")
    public ResponseEntity<Void> applyBonus(@RequestBody WalletBonusDTO request) {
        walletService.applyBonus(request);
        return ResponseEntity.ok().build();
    }
}
