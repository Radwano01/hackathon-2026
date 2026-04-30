package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.AuthDTO;
import com.example.smart_fuel_management_system.dto.LoginDTO;
import com.example.smart_fuel_management_system.dto.RegisterAuthDTO;

import java.util.UUID;

public interface AuthService {

    void register(RegisterAuthDTO request);

    AuthDTO login(LoginDTO request);

    boolean validateToken(String token);

    UUID extractUserId(String authHeader);
}