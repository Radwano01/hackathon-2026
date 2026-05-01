# Auth Service

Handles JWT token generation, validation, and authentication for all users.

## Overview

- **Port**: 8888
- **Base Path**: `/api/v1/auth`
- **Service Name**: AUTH
- **Security**: JWT-based stateless authentication

## Features

✅ User registration with password hashing (BCrypt)  
✅ JWT token generation (30-day expiry)  
✅ Token validation & verification  
✅ Password encoding & comparison  
✅ User credentials management  

## API Endpoints

### Public

```
POST /api/v1/auth/register
  Request: { email, password, firstName, lastName, phone }
  Response: { userId, token, expiresAt }
  
POST /api/v1/auth/login
  Request: { email, password }
  Response: { userId, token, expiresAt }
```

### Protected

```
POST /api/v1/auth/validate
  Request: { token }
  Response: { valid, userId, email }
  
POST /api/v1/auth/refresh
  Request: { token }
  Response: { newToken, expiresAt }
```

## JWT Token Structure

```
Header: { alg: "HS512", typ: "JWT" }
Payload: { userId, email, iat, exp }
Signature: HMAC-SHA512(secret)
```

Token expires in 30 days. Include in all protected endpoint requests:
```
Authorization: Bearer <token>
```

## Database Schema

```sql
CREATE TABLE auth_users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Configuration

```yaml
server:
  port: 8002
spring:
  application:
    name: AUTH
  datasource:
    url: jdbc:postgresql://localhost:5432/auth_db

jwt:
  secret: your-secret-key-min-32-chars
  expiration: 2592000000  # 30 days in milliseconds
```

## Running

```bash
cd auth
mvn spring-boot:run
```

Server starts on `http://localhost:8888`

## Security Best Practices

1. **Secret Key** - Use environment variable for production
2. **HTTPS Only** - Always use HTTPS in production
3. **Token Expiry** - Keep tokens short-lived (30 days)
4. **Refresh Tokens** - Implement refresh token rotation
5. **Rate Limiting** - Protect login endpoint from brute force

## Dependencies

- Spring Security
- Java JWT (jjwt)
- Spring Data JPA
- PostgreSQL Driver
- BCrypt (spring-security-crypto)
