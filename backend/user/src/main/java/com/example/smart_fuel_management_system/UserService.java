package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;

import java.util.UUID;

public interface UserService {
    void register(RegisterDTO registerDTO);
    AuthDTO login(LoginDTO loginDTO);
    UserDTO getUser(UUID userId);
    void updateUser(UUID userId, UpdateDTO updateDTO);
    void updatePassword(UUID userId, UpdatePasswordDTO passwordDTO);
    void requestResetPassword(String email);
    void resetPassword(UUID userId, String newPassword, String token);
    UserResponse getUserResponse(UUID userId);
}
