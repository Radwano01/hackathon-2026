package com.example.smart_fuel_management_system;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetTokenService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RestTemplate restTemplate;
    private final JavaMailSender mailSender;

    @Autowired
    public PasswordResetTokenService(PasswordResetTokenRepository passwordResetTokenRepository,
                                     RestTemplate restTemplate, JavaMailSender mailSender) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.restTemplate = restTemplate;
        this.mailSender = mailSender;
    }

    public void createPasswordResetToken(UUID userId) {

        UserResponse user = restTemplate.getForObject(
                "http://USER/internal/users/{userId}",
                UserResponse.class,
                userId
        );

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        passwordResetTokenRepository.deleteByUserId(userId);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUserId(userId);
        resetToken.setExpireDate(LocalDateTime.now().plusMinutes(30));

        passwordResetTokenRepository.save(resetToken);

        sendMessage(user.email(), user.fullName(), token);
    }

    private void sendMessage(String email, String fullName, String token){
        SimpleMailMessage message = new SimpleMailMessage();
        String link = "http://localhost:3000/reset-password/confirm?token=" + token;
        message.setTo(email);
        message.setSubject("🔐 Reset Your Password");

        String emailContent =
                "Hello, " +fullName + "\n\n"
                        + "We received a request to reset your password.\n\n"
                        + "Click the link below to reset it:\n"
                        + link + "\n\n"
                        + "⚠️ This link will expire in 30 minutes for security reasons.\n\n"
                        + "If you did not request this, please ignore this email.\n\n"
                        + "Best regards,\n"
                        + "Smart Fuel Management System Team";

        message.setText(emailContent);

        mailSender.send(message);
    }

    public UUID validateToken(String token) {

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new EntityNotFoundException(
                        "The token is expired or not found in our database"
                ));

        if (resetToken.getExpireDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        UUID userId = resetToken.getUserId();

        passwordResetTokenRepository.delete(resetToken);

        return userId;
    }
}
