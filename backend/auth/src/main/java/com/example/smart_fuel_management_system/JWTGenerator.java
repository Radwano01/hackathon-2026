package com.example.smart_fuel_management_system;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
public class JWTGenerator {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // =========================
    // GENERATE TOKEN
    // =========================
    public String generateToken(UUID userId, String role) {

        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(userId.toString())   // identity = userId
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    // =========================
    // EXTRACT USER ID
    // =========================
    public UUID getUserIdFromJWT(String token) {

        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();

        return UUID.fromString(claims.getSubject());
    }

    // =========================
    // VALIDATE TOKEN
    // =========================
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            throw new AuthenticationCredentialsNotFoundException("JWT expired or invalid");
        }
    }
}