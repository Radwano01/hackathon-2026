package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.AddCardDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodPaymentDTO;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService service;

    public PaymentMethodController(PaymentMethodService service) {
        this.service = service;
    }

    @PostMapping("/cards")
    public UUID addCard(Authentication authentication,
                        @RequestBody AddCardDTO dto) {
        UUID userId = UUID.fromString(authentication.getName());
        return service.addCard(userId, dto);
    }

    @GetMapping
    public List<PaymentMethodDTO> list(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return service.list(userId);
    }

    @GetMapping("/internal/{userId}")
    public List<PaymentMethodPaymentDTO> internalList(@PathVariable UUID userId) {
        return service.internalList(userId);
    }

    @DeleteMapping("/{methodId}")
    public void delete(Authentication authentication,
                       @PathVariable UUID methodId) {
        UUID userId = UUID.fromString(authentication.getName());
        service.delete(userId, methodId);
    }

    @PatchMapping("/{methodId}/default")
    public void setDefault(Authentication authentication,
                           @PathVariable UUID methodId) {
        UUID userId = UUID.fromString(authentication.getName());
        service.setDefault(userId, methodId);
    }

    @PatchMapping("/{methodId}/priority")
    public void updatePriority(Authentication authentication,
                               @PathVariable UUID methodId,
                               @RequestParam int priority) {
        UUID userId = UUID.fromString(authentication.getName());
        service.updatePriority(userId, methodId, priority);
    }
}