package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.PaymentDTO;
<<<<<<< HEAD
=======
import com.example.smart_fuel_management_system.dto.PaymentEligibilityResponse;
>>>>>>> a114d8b (readme added)
import com.example.smart_fuel_management_system.dto.PaymentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
=======
import java.math.BigDecimal;
>>>>>>> a114d8b (readme added)
import java.util.UUID;

@RestController
@RequestMapping("/internal/payments")
public class PaymentInternalController {

    private final PaymentService paymentService;

    public PaymentInternalController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/users/{userId}")
    public ResponseEntity<PaymentResponse> pay(
            @PathVariable UUID userId,
            @RequestBody PaymentDTO dto
    ) {
        return ResponseEntity.ok(paymentService.pay(userId, dto));
    }
<<<<<<< HEAD
=======

    @GetMapping("/users/{userId}/eligibility")
    public ResponseEntity<PaymentEligibilityResponse> checkEligibility(
            @PathVariable UUID userId,
            @RequestParam BigDecimal estimatedAmount
    ) {
        return ResponseEntity.ok(
                paymentService.checkEligibility(userId, estimatedAmount)
        );
    }
>>>>>>> a114d8b (readme added)
}