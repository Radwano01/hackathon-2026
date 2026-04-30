package com.example.smart_fuel_management_system;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AuthUserRepository authUserRepository;

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {

        AuthUser user = authUserRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getId().toString(),
                user.getPassword(),
                mapAuthority(user.getRole())
        );
    }

    private Collection<GrantedAuthority> mapAuthority(String role) {
        return Collections.singleton(
                new SimpleGrantedAuthority(role)
        );
    }
}