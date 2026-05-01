package com.example.smart_fuel_management_system.dto;


import java.util.UUID;

public record AuthDTO(UUID userId,
                      String token,
                      String refreshToken){}
