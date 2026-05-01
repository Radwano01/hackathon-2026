# Smart Fuel Management System

A microservices-based fuel management platform with multi-module Spring Boot architecture. Handles user management, vehicle tracking, fuel sessions, payments, wallets, and admin operations.

## Architecture Overview

```
API Gateway (Port 8080)
    ↓
┌─────────────────────────────────────────────────────┐
│  Microservices                                      │
├─────────────────────────────────────────────────────┤
│ • User Service (8200)        • Vehicle Service     │
│ • Auth Service (8888)        • Wallet Service (8010)│
│ • Station Service (8000)     • Payment Service (8100)│
│ • Transaction Service (8040) • PaymentMethod Svc (8020)│
│ • FuelSession Service (8000) • PasswordReset Svc (8070)│
│ • Eureka Discovery (8761)                          │
└─────────────────────────────────────────────────────┘
    ↓
PostgreSQL Database
```

## Modules

| Module | Port | Purpose |
|--------|------|---------|
| [api-gateway](api-gateway/README.md) | 8080 | Entry point, request routing, load balancing |
| [eureka](eureka/README.md) | 8761 | Service discovery & registration |
| [user](user/README.md) | 8200 | User registration, profile management |
| [auth](auth/README.md) | 8888 | JWT authentication, authorization |
| [vehicle](vehicle/README.md) | 8090 | Vehicle registration, RFID tracking, status management |
| [station](station/README.md) | 8000 | Fuel station info, pricing, inventory |
| [wallet](wallet/README.md) | 8010 | User wallet, balance management, bonuses |
| [payment](payment/README.md) | 8100 | Payment processing (Stripe integration) |
| [paymentMethod](paymentMethod/README.md) | 8020 | Payment method management (cards, wallet) |
| [transaction](transaction/README.md) | 8040 | Transaction tracking, status updates |
| [fuelSession](fuelSession/README.md) | 8000 | Fuel pump sessions, consumption tracking |
| [PasswordResetToken](PasswordResetToken/README.md) | 8070 | Password reset token management |

## Quick Start

### Prerequisites
- Java 17+
- PostgreSQL 12+
- Maven 3.9.6+

### Build Project
```bash
mvn clean package -DskipTests
```

### Run All Services (Docker Compose)
```bash
docker-compose up -d
```

### Run Individual Service
```bash
cd <service-name>
mvn spring-boot:run
```

## Key Features

✅ **User Management** - Registration, authentication, profile management  
✅ **Vehicle Tracking** - Vehicle registration, RFID tagging, status monitoring  
✅ **Fuel Sessions** - Real-time fuel pump sessions with consumption tracking  
✅ **Payment Processing** - Stripe integration with multiple payment methods  
✅ **Wallet System** - Balance management, bonus rewards, transaction history  
✅ **Admin Dashboard** - Station management, user monitoring, transaction analytics  
✅ **Service Discovery** - Eureka-based microservices registration  
✅ **API Gateway** - Centralized routing and authentication  

## API Documentation

All endpoints below are user-to-service APIs exposed through the gateway (`http://localhost:8080`).

### Authentication

Use bearer token for protected endpoints:

```
Authorization: Bearer <token>
```

### User APIs

#### Register

- **POST** `/api/v1/users/register`
- Auth: No
- Request body:

```json
{
  "fullName": "John Doe",
  "phoneNumber": "+201001112233",
  "email": "john@example.com",
  "password": "P@ssw0rd123"
}
```

- Response: `201 Created` (empty body)

#### Login

- **POST** `/api/v1/users/login`
- Auth: No
- Request body:

```json
{
  "phoneNumber": "+201001112233",
  "email": "john@example.com",
  "password": "P@ssw0rd123"
}
```

- Response: `200 OK`

```json
{
  "token": "<jwt_token>",
  "refreshToken": "<refresh_token>"
}
```

#### Get User

- **GET** `/api/v1/users/{userId}`
- Auth: Yes
- Response: `200 OK`

```json
{
  "id": "8f1b2a70-996a-4e11-bd93-f418bb3f8d3d",
  "fullName": "John Doe",
  "phoneNumber": "+201001112233",
  "wallet": {
    "balance": 100.0,
    "currency": "USD",
    "statusType": "ACTIVE"
  }
}
```

#### Update User

- **PUT** `/api/v1/users/{userId}`
- Auth: Yes
- Request body (all fields optional):

```json
{
  "fullName": "John A. Doe",
  "email": "john.new@example.com",
  "phoneNumber": "+201009998877"
}
```

- Response: `204 No Content`

#### Update Password

- **PUT** `/api/v1/users/{userId}/password`
- Auth: Yes
- Request body:

```json
{
  "oldPassword": "P@ssw0rd123",
  "newPassword": "N3wP@ssw0rd456"
}
```

- Response: `204 No Content`

#### Request Password Reset

- **POST** `/api/v1/users/password-reset/request?email=john@example.com`
- Auth: No
- Response: `200 OK` (empty body)

#### Reset Password

- **POST** `/api/v1/users/{userId}/password-reset?token=<token>&newPassword=<new_password>`
- Auth: No
- Response: `200 OK` (empty body)

### Vehicle APIs

#### Add Vehicle

- **POST** `/api/v1/vehicles`
- Auth: Yes
- Request body:

```json
{
  "plateNumber": "ABC-1234",
  "brand": "Toyota",
  "model": "Corolla",
  "fuelType": "REGULAR"
}
```

- Response: `201 Created`

```json
"6fd2ae8d-4dc8-4788-a3e4-0f603b37f7f6"
```

#### List Vehicles

- **GET** `/api/v1/vehicles`
- Auth: Yes
- Response: `200 OK`

```json
[
  {
    "id": "6fd2ae8d-4dc8-4788-a3e4-0f603b37f7f6",
    "brand": "Toyota",
    "model": "Corolla",
    "status": "ACTIVE"
  }
]
```

#### Get Vehicle By ID

- **GET** `/api/v1/vehicles/{vehicleId}`
- Auth: Yes
- Response: `200 OK`

```json
{
  "id": "6fd2ae8d-4dc8-4788-a3e4-0f603b37f7f6",
  "plateNumber": "ABC-1234",
  "brand": "Toyota",
  "model": "Corolla",
  "fuelType": "REGULAR",
  "status": "ACTIVE",
  "createdAt": "2026-05-01T13:15:00",
  "updatedAt": "2026-05-01T13:15:00"
}
```

#### Update Vehicle

- **PATCH** `/api/v1/vehicles/{vehicleId}`
- Auth: Yes
- Request body (all fields optional):

```json
{
  "brand": "Toyota",
  "model": "Yaris",
  "fuelType": "PREMIUM"
}
```

- Response: `204 No Content`

#### Deactivate Vehicle

- **PATCH** `/api/v1/vehicles/{vehicleId}/deactivate`
- Auth: Yes
- Response: `204 No Content`

#### Validate Vehicle

- **GET** `/api/v1/vehicles/{vehicleId}/validate`
- Auth: Yes
- Response: `200 OK`

```json
{
  "id": "6fd2ae8d-4dc8-4788-a3e4-0f603b37f7f6",
  "status": "ACTIVE",
  "fuelType": "REGULAR"
}
```

### Payment Method APIs

#### Add Card

- **POST** `/api/v1/payment-methods/cards`
- Auth: Yes
- Request body:

```json
{
  "cardHolderName": "John Doe",
  "cardNumber": "4242424242424242",
  "expiryDate": "12/29"
}
```

- Response: `200 OK`

```json
"f9958a0d-3513-4af2-a686-bc3056f2e471"
```

#### List Payment Methods

- **GET** `/api/v1/payment-methods`
- Auth: Yes
- Response: `200 OK`

```json
[
  {
    "id": "f9958a0d-3513-4af2-a686-bc3056f2e471",
    "paymentMethodType": "CARD",
    "cardHolderName": "John Doe",
    "maskedNumber": "**** **** **** 4242",
    "priority": 1,
    "isDefault": true
  }
]
```

#### Delete Payment Method

- **DELETE** `/api/v1/payment-methods/{methodId}`
- Auth: Yes
- Response: `200 OK` (empty body)

#### Set Default Payment Method

- **PATCH** `/api/v1/payment-methods/{methodId}/default`
- Auth: Yes
- Response: `200 OK` (empty body)

#### Update Payment Method Priority

- **PATCH** `/api/v1/payment-methods/{methodId}/priority?priority=2`
- Auth: Yes
- Response: `200 OK` (empty body)

### Wallet APIs

#### Get Wallet

- **GET** `/api/v1/wallet`
- Auth: Yes
- Response: `200 OK`

```json
{
  "balance": 120.5,
  "currency": "USD",
  "statusType": "ACTIVE"
}
```

#### Update Wallet Balance

- **POST** `/api/v1/wallet/update`
- Auth: Yes
- Request body:

```json
{
  "amount": 50.0,
  "type": "TOP_UP"
}
```

- Allowed `type` values: `TOP_UP`, `WITHDRAW`, `REFUND`, `BONUS`
- Response: `200 OK` (empty body)

#### Deactivate Wallet

- **PATCH** `/api/v1/wallet/deactivate`
- Auth: Yes
- Response: `204 No Content`

### Transaction APIs

#### Get Transaction History

- **GET** `/api/v1/transactions`
- Auth: Yes
- Response: `200 OK`

```json
[
  {
    "id": "149300ef-0835-42dc-9d3f-87f8dce4f4ae",
    "amount": 40.0,
    "status": "SUCCESS"
  }
]
```

#### Get Transaction Details

- **GET** `/api/v1/transactions/{transactionId}`
- Auth: Yes
- Response: `200 OK`

```json
{
  "id": "149300ef-0835-42dc-9d3f-87f8dce4f4ae",
  "amount": 40.0,
  "type": "PAYMENT",
  "status": "SUCCESS",
  "createdAt": "2026-05-01T13:20:00",
  "stationName": "Downtown Station",
  "city": "Cairo",
  "vehiclePlateNumber": "ABC-1234",
  "brand": null,
  "model": null,
  "fuelType": null,
  "paymentMethodType": "CARD",
  "price": null,
  "liter": null
}
```

## Database Schema

All services connect to PostgreSQL. Key entities:
- **Users** - User accounts and profiles
- **Vehicles** - Vehicle registry with RFID tracking
- **Stations** - Fuel station locations and pricing
- **Wallets** - User balance and transaction history
- **Transactions** - Payment and fuel transaction records
- **FuelSessions** - Fuel pump usage sessions

## Internal Service-to-Service Communication

Services communicate via HTTP using service names (Eureka discovery):
```
Payment Service → Transaction Service: http://TRANSACTION/api/v1/transactions/internal/{userId}
Transaction Service → Station Service: http://STATION/internal/stations/{id}
User Service → Wallet Service: http://WALLET/api/v1/wallet/internal/{userId}
```

## Configuration

Each service has `application.yml`:
```yaml
server:
  port: 8XXX
  
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/service_db
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
      
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
```

## Monitoring & Logs

- Eureka Dashboard: `http://localhost:8761`
- Service Health: `GET /actuator/health`
- Logs: Check `target/logs/` in each service

## Development

### Adding New Endpoint
1. Create method in Controller
2. Create corresponding Service method
3. Add Repository query if needed
4. Test with Postman/curl

### Common Issues
- **Service not found**: Ensure Eureka is running and services are registered
- **DB connection error**: Verify PostgreSQL is running and connection string is correct
- **401 Unauthorized**: Include valid JWT token in Authorization header

## License

MIT License - Smart Fuel Management System
