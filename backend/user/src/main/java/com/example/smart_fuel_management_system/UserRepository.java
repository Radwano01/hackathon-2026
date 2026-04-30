package com.example.smart_fuel_management_system;

import com.example.smart_fuel_management_system.dto.UserResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    UserResponse findEmailAndFullNameById(UUID userId);

    Optional<User> findByEmail(String email);
}
