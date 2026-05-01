package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterDTO request) {
        userService.register(request);
        return ResponseEntity.status(201).build();
    }


    @PostMapping("/login")
    public ResponseEntity<AuthDTO> login(@RequestBody LoginDTO request) {
        return ResponseEntity.ok(userService.login(request));
    }


    @GetMapping
    public ResponseEntity<UserDTO> getUser(
            Authentication authentication) {
        return ResponseEntity.ok(userService.getUser(authentication));
    }

    @PatchMapping
    public ResponseEntity<Void> updateUser(
            Authentication authentication,
            @RequestBody UpdateDTO request) {
        UUID userId = UUID.fromString(authentication.getName());
        userService.updateUser(userId, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> updatePassword(
            Authentication authentication,
            @RequestBody UpdatePasswordDTO request) {
        UUID userId = UUID.fromString(authentication.getName());
        userService.updatePassword(userId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<Void> requestReset(@RequestParam String email) {
        userService.requestResetPassword(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password-reset")
    public ResponseEntity<Void> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {

        userService.resetPassword(token, newPassword);
        return ResponseEntity.ok().build();
    }
}