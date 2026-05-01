# Payment Preference Service

## Overview

The Payment Preference Service manages user payment preferences. It allows users to set their preferred payment method (wallet or payment card) for fuel purchases in the Smart Fuel Management System.

**Service Port:** 8090 (configurable)  
**Base URL:** `/api/v1/payment-preferences`

---

## Features

- Get user's payment preference
- Set wallet as preferred payment method
- Set payment card as preferred payment method
- Preference persistence
- Default preference management
- Support for multiple payment types

---

## API Endpoints

### 1. Get Payment Preference

Retrieves the authenticated user's payment preference.

```
GET /api/v1/payment-preferences/{userId}
```

**Path Parameters:**
- `userId` (UUID, required) - User's unique identifier

**Response:** `200 OK`
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "preferredType": "CARD",
  "preferredCardId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response (wallet preferred):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "preferredType": "WALLET",
  "preferredCardId": null
}
```

**Error Codes:**
- `404` - User preference not found

---

### 2. Set Wallet as Preferred

Sets the user's wallet as their preferred payment method.

```
POST /api/v1/payment-preferences/{userId}/wallet
```

**Path Parameters:**
- `userId` (UUID, required) - User's unique identifier

**Response:** `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "preferredType": "WALLET",
  "preferredCardId": null,
  "createdAt": "2025-05-01T10:30:00Z",
  "updatedAt": "2025-05-01T10:30:00Z"
}
```

**Error Codes:**
- `400` - Invalid request
- `404` - User not found

**Notes:**
- Sets `preferredType` to `WALLET`
- Clears any previously selected card ID
- Wallet must exist for user

---

### 3. Set Card as Preferred

Sets a specific payment card as the user's preferred payment method.

```
POST /api/v1/payment-preferences/{userId}/card/{cardId}
```

**Path Parameters:**
- `userId` (UUID, required) - User's unique identifier
- `cardId` (UUID, required) - Payment card's unique identifier

**Response:** `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "preferredType": "CARD",
  "preferredCardId": "660e8400-e29b-41d4-a716-446655440001",
  "createdAt": "2025-05-01T10:30:00Z",
  "updatedAt": "2025-05-01T10:30:00Z"
}
```

**Error Codes:**
- `400` - Invalid card ID
- `404` - User or card not found
- `409` - Card does not belong to user

**Notes:**
- Sets `preferredType` to `CARD`
- Stores the selected card ID
- Card must belong to the user
- Card must be active/valid

---

## Data Types

### PaymentPreferenceDTO
```typescript
{
  userId: UUID;              // User's unique identifier
  preferredType: string;     // WALLET or CARD
  preferredCardId: UUID;     // Card ID if CARD is preferred (null for WALLET)
}
```

### PaymentPreference (Entity)
```typescript
{
  id: UUID;                  // Preference record ID
  userId: UUID;              // User's unique identifier
  preferredType: string;     // WALLET or CARD
  preferredCardId: UUID;     // Card ID if CARD is preferred
  createdAt: DateTime;       // Creation timestamp
  updatedAt: DateTime;       // Last update timestamp
}
```

**PreferredType enum values:**
- `WALLET` - Wallet is preferred payment method
- `CARD` - Payment card is preferred payment method

---

## Configuration

Create `application.yml` in the resources directory:

```yaml
spring:
  application:
    name: paymentpreference
  jpa:
    database: MYSQL
    hibernate:
      ddl-auto: update
    show-sql: false
  datasource:
    url: jdbc:mysql://localhost:3306/payment_preference_db
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver

server:
  port: 8090

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/

payment-preference:
  default-type: WALLET  # Default preference for new users
```

---

## Database Schema

```sql
CREATE TABLE payment_preferences (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) UNIQUE NOT NULL,
    preferred_type VARCHAR(20) NOT NULL DEFAULT 'WALLET',
    preferred_card_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_id ON payment_preferences(user_id);
CREATE INDEX idx_preferred_type ON payment_preferences(preferred_type);
```

---

## Service-to-Service Integration

### Called by Payment Service
To determine which payment method to use:
```
GET http://PAYMENTPREFERENCE/api/v1/payment-preferences/{userId}
```

---

## Business Rules

1. **Unique Per User:** Only one preference record per user
2. **Default Preference:** New users default to WALLET
3. **Card Validation:** Card must exist and belong to user when setting as preferred
4. **Wallet Fallback:** If card is deleted, preference automatically reverts to WALLET
5. **Preference Update:** Can be changed at any time

---

## Workflow

1. **User Registration** → Default preference set to WALLET
2. **User Adds Card** → Can set as preferred if desired
3. **Payment Processing** → Uses preferred method stored here
4. **Card Deletion** → Preference updated if deleted card was preferred
5. **User Updates Preference** → Via these endpoints

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "timestamp": "2025-05-01T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Payment preference not found for user",
  "path": "/api/v1/payment-preferences/550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

---

## Testing

### Example cURL requests:

**Get Preference:**
```bash
curl -X GET http://localhost:8090/api/v1/payment-preferences/550e8400-e29b-41d4-a716-446655440000
```

**Set Wallet as Preferred:**
```bash
curl -X POST http://localhost:8090/api/v1/payment-preferences/550e8400-e29b-41d4-a716-446655440000/wallet
```

**Set Card as Preferred:**
```bash
curl -X POST http://localhost:8090/api/v1/payment-preferences/550e8400-e29b-41d4-a716-446655440000/card/660e8400-e29b-41d4-a716-446655440001
```

---

## Use Cases

### Case 1: User Prefers Wallet
```
User has wallet with balance.
User wants to use wallet for all fuel purchases.
→ GET preference returns WALLET, no card ID
→ Payment Service uses wallet balance
```

### Case 2: User Prefers Card
```
User adds credit card.
User wants to use card for purchases.
→ SET preference to CARD with card ID
→ Payment Service uses card for authorization
```

### Case 3: User Switches Payment Method
```
User previously used card, now wants wallet.
→ POST /wallet endpoint updates preference
→ Previous card reference removed
→ Next payment uses wallet
```

---

## License

Proprietary - Smart Fuel Management System

---

**Last Updated:** May 1, 2026
