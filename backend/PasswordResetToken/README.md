# PasswordResetToken Service

Manages password reset flows: token generation, validation, and expiration handling.

## Overview

- **Port**: 8070
- **Base Path**: `/api/v1/password-reset`
- **Service Name**: PASSWORD-RESET-TOKEN
- **Database**: PostgreSQL (password_reset_tokens table)

## Features

✅ Secure token generation (random, unique)  
✅ Email-based password reset  
✅ Token expiration (24 hours)  
✅ One-time token use  
✅ Reset link validation  

## API Endpoints

### Public (No Auth)

```
POST /api/v1/password-reset/request
  Request: { email }
  Response: { message: "Reset email sent" }
  
POST /api/v1/password-reset/validate
  Request: { token }
  Response: { valid: true/false, expiresAt: "2024-01-02T10:00:00Z" }
  
POST /api/v1/password-reset/reset
  Request: { token, newPassword }
  Response: { message: "Password reset successful" }
```

## Database Schema

```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Reset Flow

```
1. User clicks "Forgot Password"
   ↓
2. Enter email address
   ↓
3. POST /api/v1/password-reset/request?email=user@example.com
   → Generate random token
   → Store token (expires in 24 hours)
   → Send email with reset link
   ↓
4. User receives email with link:
   https://app.com/reset-password?token=abc123xyz
   ↓
5. User clicks link, enters new password
   ↓
6. POST /api/v1/password-reset/reset
   Request: { token: "abc123xyz", newPassword: "newPass123" }
   → Validate token (not expired, not used)
   → Hash new password
   → Update user auth record
   → Mark token as used
   → Return success
   ↓
7. User logs in with new password
```

## Token Characteristics

- **Length**: 32 characters (random hex)
- **Uniqueness**: Database unique constraint
- **Expiration**: 24 hours from creation
- **One-time use**: Marked as used after password reset
- **Revocation**: Mark as used if reset fails

## Email Template

```
Subject: Password Reset Request

Hello User,

Click the link below to reset your password:
https://app.com/reset-password?token=<TOKEN>

This link expires in 24 hours.

If you didn't request this, ignore this email.

Best regards,
Smart Fuel Management System
```

## Security Measures

1. **Token Randomness** - Cryptographically secure random
2. **Short Expiry** - 24 hours maximum
3. **One-time use** - Token invalidated after use
4. **HTTPS only** - All password operations over HTTPS
5. **Rate limiting** - Max 3 reset requests per email/hour
6. **No user enumeration** - Generic "email sent" response

## Running

```bash
cd PasswordResetToken
mvn spring-boot:run
```

Server starts on `http://localhost:8070`

## Configuration

```yaml
server:
  port: 8010
spring:
  application:
    name: PASSWORD-RESET-TOKEN
  datasource:
    url: jdbc:postgresql://localhost:5432/password_reset_db
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

password-reset:
  token-expiry-hours: 24
  token-length: 32
  from-email: noreply@smartfuel.com
```

## Email Service Integration

```
POST /api/v1/password-reset/request
  ↓
Generate token
  ↓
Call Email Service
  ↓
Send reset email with token
```

## Error Handling

| Error | Status | Response |
|-------|--------|----------|
| Email not found | 404 | Generic "email sent" (for security) |
| Token expired | 400 | "Reset link expired. Request new one" |
| Token already used | 400 | "Token already used. Request new reset" |
| Invalid password | 422 | "Password must be 8+ chars, mix of cases" |

## Running Tests

```bash
mvn test
```

## Dependencies

- Spring Web
- Spring Data JPA
- Spring Mail
- PostgreSQL Driver
- Spring Security
- Spring Cloud Eureka
