package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface UserService {
    void register(RegisterDTO registerDTO);
    AuthDTO login(LoginDTO loginDTO);
    UserDTO getUser(Authentication authentication);
    void updateUser(UUID userId, UpdateDTO updateDTO);
    void updatePassword(UUID userId, UpdatePasswordDTO passwordDTO);
    void requestResetPassword(String email);
    void resetPassword(String newPassword, String token);
    UserResponse getUserResponse(UUID userId);
}
