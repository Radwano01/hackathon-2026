package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.WalletDTO;
import com.example.smart_fuel_management_system.dto.WalletUpdateDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * User Wallet API - Authenticated user operations
 * Base path: /api/v1/wallet
 * Requires: Valid JWT token in Authorization header
 */
@RestController
@RequestMapping("/api/v1/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Get authenticated user's wallet details
     * GET /api/v1/wallet
     */
    @GetMapping
    public ResponseEntity<WalletDTO> getWallet(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(walletService.getWalletDetails(userId));
    }

    /**
     * User updates their wallet balance (top-up, withdraw, refund)
     * POST /api/v1/wallet/update
     * Body: { "amount": 100, "type": "TOP_UP|WITHDRAW|REFUND|BONUS" }
     */
    @PostMapping("/update")
    public ResponseEntity<Void> updateBalance(
            Authentication authentication,
            @RequestBody WalletUpdateDTO request) {
        UUID userId = UUID.fromString(authentication.getName());
        walletService.updateBalance(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * User deactivates their own wallet
     * PATCH /api/v1/wallet/deactivate
     */
    @PatchMapping("/deactivate")
    public ResponseEntity<Void> deactivate(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        walletService.deactivateWallet(userId);
        return ResponseEntity.noContent().build();
    }
<<<<<<< HEAD

    //admin page
    @PatchMapping("/activate")
    public ResponseEntity<Void> activate(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        walletService.activateWallet(userId);
        return ResponseEntity.noContent().build();
    }

    //admin page
    @PatchMapping("/block")
    public ResponseEntity<Void> block(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        walletService.blockWallet(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bonus")
    public ResponseEntity<Void> bonus(@RequestBody WalletBonusDTO walletBonusDTO
    ) {
        walletService.applyBonus(walletBonusDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/internal/{userId}")
    public ResponseEntity<Void> internalCreateWallet(@PathVariable UUID userId) {
        walletService.createWallet(userId);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/internal/{userId}")
    public ResponseEntity<WalletDTO> internalGetWallet(@PathVariable UUID userId) {
        return ResponseEntity.ok(walletService.getWalletDetails(userId));
    }

    @PostMapping("/internal/{userId}/update")
    public ResponseEntity<Void> internalUpdate(
            @PathVariable UUID userId,
            @RequestBody WalletUpdateDTO walletUpdateDTO) {
        walletService.updateBalance(userId, walletUpdateDTO);
        return ResponseEntity.ok().build();
    }
=======
>>>>>>> a114d8b (readme added)
}