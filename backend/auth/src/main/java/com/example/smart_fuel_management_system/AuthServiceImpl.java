package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.AuthDTO;
import com.example.smart_fuel_management_system.dto.LoginDTO;
import com.example.smart_fuel_management_system.dto.RegisterAuthDTO;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final JWTGenerator jwtGenerator;
    private final PasswordEncoder passwordEncoder;


    @Override
    public void register(RegisterAuthDTO request) {

        if (authUserRepository.existsById(request.userId())) {
            throw new EntityExistsException("Auth already exists for this user");
        }

        AuthUser user = new AuthUser();
        user.setId(request.userId());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        authUserRepository.save(user);
    }

    @Override
    public AuthDTO login(LoginDTO request) {

        AuthUser user = authUserRepository.findById(request.userId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtGenerator.generateToken(user.getId(), user.getRole());

        return new AuthDTO(token, user.getId());
    }

    @Override
    public boolean validateToken(String token) {
        return jwtGenerator.validateToken(token);
    }


    @Override
    public UUID extractUserId(String authHeader) {

        String token = authHeader.replace("Bearer ", "");

        return jwtGenerator.getUserIdFromJWT(token);
    }
}