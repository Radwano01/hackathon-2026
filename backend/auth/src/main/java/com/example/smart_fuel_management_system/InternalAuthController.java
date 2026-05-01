package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.RegisterAuthDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Internal Auth API - Service-to-service communication
 * Base path: /internal/auth
 * No authentication required - for internal Eureka service calls only
 */
@RestController
@RequestMapping("/internal/auth")
@RequiredArgsConstructor
public class InternalAuthController {

    private final AuthService authService;

    /**
     * Register user credentials during user registration flow
     * Called by: User Service
     * POST /internal/auth/register
     * Body: { "userId": "...", "password": "...", "role": "USER" }
     */
    @PostMapping("/register")
    public ResponseEntity<Void> registerInternal(@RequestBody RegisterAuthDTO request) {
        authService.register(request);
        return ResponseEntity.status(201).build();
    }
}
