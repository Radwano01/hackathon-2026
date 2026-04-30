package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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


    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateUser(
            @PathVariable UUID userId,
            @RequestBody UpdateDTO request) {

        userService.updateUser(userId, request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable UUID userId,
            @RequestBody UpdatePasswordDTO request) {

        userService.updatePassword(userId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<Void> requestReset(@RequestParam String email) {
        userService.requestResetPassword(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/password-reset")
    public ResponseEntity<Void> resetPassword(
            @PathVariable UUID userId,
            @RequestParam String token,
            @RequestParam String newPassword) {

        userService.resetPassword(userId, newPassword, token);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/{userId}/internal")
    public ResponseEntity<UserResponse> getUserResponse(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserResponse(userId));
    }
}