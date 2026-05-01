# API Gateway Service

Central entry point for all client requests. Routes traffic to microservices, handles load balancing, and enforces authentication.

## Overview

- **Port**: 8080
- **Role**: Request routing, authentication gateway, load balancing
- **Registry**: Eureka discovery enabled

## Features

✅ Route all requests to appropriate microservices  
✅ JWT token validation before forwarding  
✅ Service discovery via Eureka  
✅ Load balancing with Ribbon/Spring Cloud  
✅ CORS support for client applications  

## Configuration

```yaml
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://USER
          predicates:
            - Path=/api/v1/users/**
        - id: vehicle-service
          uri: lb://VEHICLE
          predicates:
            - Path=/api/v1/vehicles/**
        # ... more routes
```

## Running

```bash
cd api-gateway
mvn spring-boot:run
```

Gateway will start on `http://localhost:8080`

## Key Routes

| Path | Routes To | Auth Required |
|------|-----------|---------------|
| `/api/v1/users/**` | User Service | ❌ (register/login) / ✅ (profile) |
| `/api/v1/auth/**` | Auth Service | ❌ (register/login/validate) |
| `/api/v1/vehicles/**` | Vehicle Service | ✅ |
| `/api/v1/wallet/**` | Wallet Service | ✅ |
| `/api/v1/stations/**` | Station Service | ❌ |
| `/api/v1/transactions/**` | Transaction Service | ✅ |
| `/api/v1/payment-methods/**` | PaymentMethod Service | ✅ |
| `/api/v1/payments/**` | Payment Service | ✅ |
| `/api/v1/admin/**` | Various Services | ✅ (admin only) |

## Authentication

All protected endpoints require JWT token:
```bash
curl -H "Authorization: Bearer <your_jwt_token>" http://localhost:8080/api/v1/vehicles
```

## Healthcheck

```bash
curl http://localhost:8080/actuator/health
```

## Dependencies

- Spring Cloud Gateway
- Spring Cloud Netflix Eureka Client
- Spring Security (JWT validation)
