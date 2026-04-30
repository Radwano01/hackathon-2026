package com.example.smart_fuel_management_system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/password-reset-token")
public class PasswordResetTokenController {

    private final PasswordResetTokenService passwordResetTokenService;

    @Autowired
    public PasswordResetTokenController(PasswordResetTokenService passwordResetTokenService) {
        this.passwordResetTokenService = passwordResetTokenService;
    }

    @PostMapping("/create")
    public ResponseEntity<Void> sendToken(Authentication authentication){
        UUID userId = UUID.fromString(authentication.getName());
        passwordResetTokenService.createPasswordResetToken(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<Void> validateToken(@RequestParam("token") String token){
        passwordResetTokenService.validateToken(token);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/internal/{userId}/create")
    public ResponseEntity<Void> internalSendToken(@PathVariable UUID userId) {
        passwordResetTokenService.createPasswordResetToken(userId);
        return ResponseEntity.noContent().build();
    }
}
