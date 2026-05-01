package com.example.smart_fuel_management_system;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment-preferences")
@RequiredArgsConstructor
public class PaymentPreferenceController {

    private final PaymentPreferenceService service;

    @GetMapping("/{userId}")
    public PaymentPreferenceDTO get(@PathVariable UUID userId) {
        return service.get(userId);
    }

    @PostMapping("/{userId}/wallet")
    public PaymentPreference setWallet(@PathVariable UUID userId) {
        return service.setWalletPreferred(userId);
    }

    @PostMapping("/{userId}/card/{cardId}")
    public PaymentPreference setCard(@PathVariable UUID userId,
                                     @PathVariable UUID cardId) {
        return service.setCardPreferred(userId, cardId);
    }
}