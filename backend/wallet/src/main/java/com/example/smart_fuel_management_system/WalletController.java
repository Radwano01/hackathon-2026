package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.WalletBonusDTO;
import com.example.smart_fuel_management_system.dto.WalletDTO;
import com.example.smart_fuel_management_system.dto.WalletUpdateDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping
    public ResponseEntity<Void> createWallet(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        walletService.createWallet(userId);
        return ResponseEntity.status(201).build();
    }

    @GetMapping
    public ResponseEntity<WalletDTO> getWallet(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(walletService.getWalletDetails(userId));
    }

    @PostMapping("/update")
    public ResponseEntity<Void> update(
            Authentication authentication,
            @RequestBody WalletUpdateDTO walletUpdateDTO
            ) {
        UUID userId = UUID.fromString(authentication.getName());
        walletService.updateBalance(userId, walletUpdateDTO);
        return ResponseEntity.ok().build();
    }

    //user page
    @PatchMapping("/deactivate")
    public ResponseEntity<Void> deactivate(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        walletService.deactivateWallet(userId);
        return ResponseEntity.noContent().build();
    }

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
}