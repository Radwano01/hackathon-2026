package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.AuthDTO;
import com.example.smart_fuel_management_system.dto.LoginDTO;
import com.example.smart_fuel_management_system.dto.RegisterAuthDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterAuthDTO request) {
        authService.register(request);
        return ResponseEntity.status(201).build();
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<AuthDTO> login(@RequestBody LoginDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // =========================
    // VALIDATE TOKEN (optional but useful for other services)
    // =========================
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
        return ResponseEntity.ok(authService.validateToken(token));
    }

    // =========================
    // GET USER ID FROM TOKEN (optional helper endpoint)
    // =========================
    @GetMapping("/me")
    public ResponseEntity<UUID> getMyUserId(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(authService.extractUserId(authHeader));
    }
}