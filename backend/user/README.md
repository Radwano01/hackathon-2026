# User Service

Manages user registration, authentication, and profile management. Entry point for new users joining the system.

## Overview

- **Port**: 8200
- **Base Path**: `/api/v1/users`
- **Service Name**: USER
- **Database**: PostgreSQL (users table)

## Features

✅ User registration with email validation  
✅ User authentication (delegates to Auth Service)  
✅ Profile management (get/update user info)  
✅ User search and listing (admin)  
✅ Automatic wallet creation on registration  

## API Endpoints

### Public (No Auth)

```
POST /api/v1/users/register
  Request: { email, password, firstName, lastName, phone }
  Response: { userId, email, createdAt }
  
POST /api/v1/users/login
  Request: { email, password }
  Response: { userId, token, expiresAt }
```

### Protected (Auth Required)

```
GET /api/v1/users/profile
  Response: { id, email, firstName, lastName, phone, createdAt }
  
PATCH /api/v1/users/profile
  Request: { firstName, lastName, phone }
  Response: 204 No Content
  
GET /api/v1/users/{userId}
  Response: { id, email, firstName, lastName, phone }
```

### Internal (Service-to-Service)

```
GET /internal/users/{userId}
  Response: { id, email, firstName, lastName }
```

## Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Running

```bash
cd user
mvn spring-boot:run
```

Server starts on `http://localhost:8200`

## Integration with Other Services

On registration, automatically triggers:
1. **Auth Service**: Create auth credentials
2. **Wallet Service**: Create user wallet with zero balance

## Configuration

```yaml
server:
  port: 8001
spring:
  application:
    name: USER
  datasource:
    url: jdbc:postgresql://localhost:5432/user_db
```

## Dependencies

- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Spring Cloud Eureka
