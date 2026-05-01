package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.UUID;


@Service
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public UserServiceImpl(UserRepository userRepository1, RestTemplate restTemplate) {
        this.userRepository = userRepository1;
        this.restTemplate = restTemplate;
    }

    @Override
    public void register(RegisterDTO registerDTO) {

        if (userRepository.existsByEmail(registerDTO.email())) {
            throw new EntityExistsException("Email already exists");
        }

        if (userRepository.existsByPhoneNumber(registerDTO.phoneNumber())) {
            throw new EntityExistsException("Phone number already exists");
        }

        User user = new User(
                registerDTO.fullName(),
                registerDTO.phoneNumber(),
                registerDTO.email(),
                registerDTO.password()
        );

        User savedUser = userRepository.save(user);
        UUID userId = savedUser.getId();

        boolean walletCreated = false;
        boolean authCreated = false;

        try {
            // =========================
            // 1. CREATE WALLET
            // =========================
            restTemplate.postForObject(
                    "http://WALLET/internal/wallet/{userId}",
                    null,
                    Void.class,
                    user.getId()
            );
            walletCreated = true;

            // =========================
            // 2. CREATE AUTH
            // =========================
            RegisterAuthDTO authRequest = new RegisterAuthDTO(
                    userId,
                    registerDTO.password(),
                    "USER"
            );

            restTemplate.postForObject(
                    "http://AUTH/api/v1/auth/register",
                    authRequest,
                    Void.class
            );
            authCreated = true;

        } catch (Exception e) {

            try {
                if (walletCreated) {
                    restTemplate.delete(
                            "http://WALLET/internal/wallet/" + userId
                    );
                }
            } catch (Exception ignored) {}

            userRepository.deleteById(userId);

            throw new RuntimeException("Registration failed. Rolled back.", e);
        }
    }

    @Override
    public AuthDTO login(LoginDTO loginDTO) {

        User user = userRepository.findByPhoneNumber(loginDTO.phoneNumber())
                .orElseThrow(() -> new EntityNotFoundException("this phone number is not found"));

        LoginAuthDTO request = new LoginAuthDTO(
                user.getId(),
                loginDTO.password()
        );

        AuthDTO response = restTemplate.postForObject(
                "http://AUTH/api/v1/auth/login",
                request,
                AuthDTO.class
        );

        if (response == null) {
            throw new IllegalStateException("Auth service unavailable");
        }

        return new AuthDTO(
                user.getId(),
                response.token(),
                response.refreshToken()
        );
    }

    @Override
    public UserDTO getUser(Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());

        String token = (authentication.getCredentials() != null)
                ? authentication.getCredentials().toString()
                : null;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<WalletDTO> response = restTemplate.exchange(
                "http://WALLET/api/v1/wallet",
                HttpMethod.GET,
                entity,
                WalletDTO.class
        );

        WalletDTO walletDTO = response.getBody();

        // 4. Get user from DB using userId (NOT token)
        User user = findUserById(userId);

        // 5. Build response
        return UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .wallet(walletDTO)
                .build();
    }

    @Override
    @Transactional
    public void updateUser(UUID userId, UpdateDTO updateDTO) {
        User user = findUserById(userId);

        boolean changes = false;
        if(updateDTO.fullName() != null){
            user.setFullName(updateDTO.fullName());
            changes = true;
        }
        if(updateDTO.email() != null){
            if(existsEmail(updateDTO.email())){
                throw new EntityExistsException("the email or phone number you entered is already valid");
            }
            user.setEmail(updateDTO.email());
            changes = true;
        }
        if(updateDTO.phoneNumber() != null){
            if(existsPhoneNumber(updateDTO.phoneNumber())){
                throw new EntityExistsException("the email or phone number you entered is already valid");
            }
            user.setPhoneNumber(updateDTO.phoneNumber());
            changes = true;
        }

        if(changes) userRepository.save(user);
    }

    @Override
    @Transactional
    public void updatePassword(UUID userId, UpdatePasswordDTO passwordDTO) {
        User user = findUserById(userId);
        if(!user.getPassword().equals(passwordDTO.oldPassword())){
            throw new IllegalArgumentException("Old password is incorrect");
        }
        if(user.getPassword().equals(passwordDTO.newPassword())){
            throw new IllegalArgumentException("New password must be different from old password");
        }

        user.setPassword(passwordDTO.newPassword());
        userRepository.save(user);
    }

    @Override
    public void requestResetPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new EntityNotFoundException("The email you entered is not valid in our database"));

        restTemplate.postForObject(
                "http://PASSWORDRESETTOKEN/api/v1/password-reset-token/create/{userId}",
                null,
                Void.class,
                user.getId()
        );
    }

    @Override
    public void resetPassword(String token, String newPassword) {

        // validate + get userId from token service
        UUID userId = restTemplate.postForObject(
                "http://PASSWORDRESETTOKEN/api/v1/password-reset-token/validate?token=" + token,
                null,
                UUID.class
        );

        if (userId == null) {
            throw new RuntimeException("Invalid or expired token");
        }

        User user = findUserById(userId);

        user.setPassword(newPassword);
        userRepository.save(user);
    }

    public UserResponse getUserResponse(UUID userId){
        return userRepository.findEmailAndFullNameById(userId);
    }

    private User findUserById(UUID userId){
        return userRepository.findById(userId)
                .orElseThrow(()-> new EntityNotFoundException("User id is not found in our database"));
    }
    private boolean existsEmail(String email){
        return userRepository.existsByEmail(email);
    }

    private boolean existsPhoneNumber(String phone){
        return userRepository.existsByPhoneNumber(phone);
    }
}
