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

    @PostMapping("/create/{userId}")
    public ResponseEntity<Void> sendToken(@PathVariable UUID userId){
        passwordResetTokenService.createPasswordResetToken(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<UUID> validateToken(@RequestParam("token") String token){
        return ResponseEntity.ok(passwordResetTokenService.validateToken(token));
    }
}
