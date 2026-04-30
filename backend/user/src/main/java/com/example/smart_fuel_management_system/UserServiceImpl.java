package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.*;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

        restTemplate.postForObject(
                "http://WALLET/api/v1/wallet/internal/{userId}",
                new CreateWalletRequest(),
                Void.class,
                savedUser.getId()
        );

        RegisterAuthDTO authRequest = new RegisterAuthDTO(
                savedUser.getId(),
                registerDTO.password(),
                "USER"
        );

        restTemplate.postForObject(
                "http://AUTH/api/v1/auth/register",
                authRequest,
                Void.class
        );
    }

    @Override
    public AuthDTO login(LoginDTO loginDTO) {
        AuthDTO response = restTemplate.postForObject(
                "http://AUTH/api/v1/auth/login",
                loginDTO,
                AuthDTO.class
        );

        if (response == null) {
            throw new IllegalStateException("Auth service unavailable");
        }

        return response;
    }

    @Override
    public UserDTO getUser(UUID userId) {
        User user = findUserById(userId);

        WalletDTO walletDTO = restTemplate.getForObject(
                "http://WALLET/api/v1/" + user.getId() + "/wallet",
                WalletDTO.class
        );

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
        if(user.getPassword().equals(passwordDTO.oldPassword())){
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
                "http://PASSWORDRESETTOKEN/api/v1/password-reset-token/create/" + user.getId()
                        + "?email=" + user.getEmail(),
                null,
                Void.class
        );
    }

    @Override
    public void resetPassword(UUID userId, String newPassword, String token) {
        restTemplate.postForObject(
                "http://PASSWORDRESETTOKEN/api/v1/password-reset-token/validate?token=" + token,
                null,
                Void.class
        );
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
