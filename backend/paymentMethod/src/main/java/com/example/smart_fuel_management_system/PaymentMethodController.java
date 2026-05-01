package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.AddCardDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodDTO;
import com.example.smart_fuel_management_system.dto.PaymentMethodPaymentDTO;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<Void> addCard(
            Authentication authentication,
            @RequestBody AddCardDTO dto
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        service.addCard(userId, dto);

        return ResponseEntity.status(201).build(); // CREATED
    }

    @GetMapping
    public ResponseEntity<List<PaymentMethodDTO>> list(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(service.list(userId));
    }

    @GetMapping("/internal/{userId}")
    public ResponseEntity<List<PaymentMethodPaymentDTO>> internalList(
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(service.internalList(userId));
    }

    @DeleteMapping("/{methodId}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable UUID methodId
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        service.delete(userId, methodId);

        return ResponseEntity.noContent().build(); // 204
    }

    @PatchMapping("/{methodId}/default")
    public ResponseEntity<Void> setDefault(
            Authentication authentication,
            @PathVariable UUID methodId
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        service.setDefault(userId, methodId);

        return ResponseEntity.noContent().build();
    }
}