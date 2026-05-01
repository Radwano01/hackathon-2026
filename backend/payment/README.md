# Payment Service

## Overview

The Payment Service handles payment processing, transaction authorization, and payment eligibility checks. It integrates with external payment gateways (Visa, etc.) and manages payment flows for fuel purchases in the Smart Fuel Management System.

**Service Port:** 8089 (configurable)  
**Base URL:** `/internal/payments` (Internal Service Only)

---

## Features

- Process fuel purchase payments
- Check payment eligibility
- Visa/payment gateway integration
- Authorization and settlement
- Payment status tracking
- Wallet balance validation
- Transaction processing

---

## API Endpoints

### 1. Process Payment

Processes a payment for a user's fuel purchase.

```
POST /internal/payments/users/{userId}
```

**Path Parameters:**
- `userId` (UUID, required) - User's unique identifier

**Request Body:**
```json
{
  "amount": 45.50,
  "orderId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response:** `200 OK`
```json
{
  "transactionId": "880e8400-e29b-41d4-a716-446655440003",
  "status": "PENDING",
  "amount": 45.50
}
```

**Error Codes:**
- `400` - Invalid payment data
- `404` - User not found
- `402` - Payment failed (insufficient funds, card declined)

**Notes:**
- Internal endpoint for service-to-service communication only
- Called by Fuel Session Service during stop session
- Returns payment response with transaction ID

---

### 2. Check Payment Eligibility

Checks whether a user is eligible to make a payment of a specific amount.

```
GET /internal/payments/users/{userId}/eligibility
```

**Path Parameters:**
- `userId` (UUID, required) - User's unique identifier

**Query Parameters:**
- `estimatedAmount` (BigDecimal, required) - Estimated payment amount

**Response:** `200 OK`
```json
{
  "eligible": true,
  "reason": "Sufficient wallet balance"
}
```

**Error Response (ineligible):**
```json
{
  "eligible": false,
  "reason": "Insufficient wallet balance"
}
```

**Error Codes:**
- `400` - Invalid amount
- `404` - User not found

**Notes:**
- Checks user's wallet balance
- Checks user's payment method availability
- Checks account/wallet status (not blocked, not inactive)
- Called before starting fuel session

---

## Data Types

### PaymentDTO
```typescript
{
  amount: BigDecimal;      // Payment amount
  orderId: UUID;           // Order/transaction reference ID
}
```

### PaymentResponse
```typescript
{
  transactionId: UUID;     // Generated transaction ID
  status: string;          // Payment status
  amount: BigDecimal;      // Payment amount
}
```

### PaymentEligibilityResponse
```typescript
{
  eligible: boolean;       // Whether user can make payment
  reason: string;          // Reason for eligibility/ineligibility
}
```

**PaymentStatusType enum values:**
- `PENDING` - Payment pending processing
- `PROCESSING` - Payment being processed
- `SUCCESS` - Payment successful
- `FAILED` - Payment failed
- `DECLINED` - Payment declined (card/account issue)
- `REFUNDED` - Payment refunded

---

## Configuration

Create `application.yml` in the resources directory:

```yaml
spring:
  application:
    name: payment
  jpa:
    database: MYSQL
    hibernate:
      ddl-auto: update
    show-sql: false
  datasource:
    url: jdbc:mysql://localhost:3306/payment_db
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver

server:
  port: 8089

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/

payment:
  gateway: VISA
  timeout-seconds: 30
  retry-attempts: 3

visa:
  api-key: your-visa-api-key
  api-secret: your-visa-api-secret
  endpoint: https://api.visa.com/payments
```

---

## Database Schema

```sql
CREATE TABLE payments (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    order_id BINARY(16) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    authorization_code VARCHAR(255),
    gateway_transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE payment_logs (
    id BINARY(16) PRIMARY KEY,
    payment_id BINARY(16) NOT NULL,
    event VARCHAR(100) NOT NULL,
    details VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE INDEX idx_user_id ON payments(user_id);
CREATE INDEX idx_order_id ON payments(order_id);
CREATE INDEX idx_status ON payments(status);
CREATE INDEX idx_created_at ON payments(created_at);
```

---

## Service-to-Service Integration

### Called by Fuel Session Service
When stopping a fuel session:
```
POST http://PAYMENT/internal/payments/users/{userId}
```

Request:
```json
{
  "amount": 45.50,
  "orderId": "session-id-uuid"
}
```

### Called by Fuel Session Service
Before starting a fuel session:
```
GET http://PAYMENT/internal/payments/users/{userId}/eligibility?estimatedAmount=500
```

---

## Payment Flow

1. **Pre-Payment Check**: Fuel Session Service checks eligibility via `/eligibility` endpoint
2. **Estimated Cost**: If eligible, session can start
3. **Payment Processing**: When session stops, actual amount is sent to `/users/{userId}` endpoint
4. **Authorization**: Payment gateway (Visa) authorizes transaction
5. **Settlement**: Amount is deducted from wallet or charged to card
6. **Confirmation**: Transaction ID returned to Fuel Session Service

---

## Business Rules

1. **Amount Precision:** Payments stored with 2 decimal places (cents)
2. **User Validation:** User must exist and have active payment method
3. **Wallet Check:** Must have sufficient wallet balance OR valid payment card
4. **Eligibility:** Checked before every transaction
5. **Retry Logic:** Up to 3 retry attempts on network failures
6. **Timeout:** 30-second timeout for payment gateway responses

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "timestamp": "2025-05-01T10:30:00Z",
  "status": 402,
  "error": "Payment Failed",
  "message": "Insufficient wallet balance",
  "path": "/internal/payments/users/550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Security Considerations

- All API endpoints are internal only (no external access)
- Payment data encrypted in transit (TLS/SSL)
- Card data never stored in plain text
- PCI compliance for payment processing
- Rate limiting on payment attempts
- Fraud detection integration

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
<dependency>
    <groupId>com.visa</groupId>
    <artifactId>visa-java-sdk</artifactId>
    <version>latest</version>
</dependency>
```

---

## Testing

### Example requests (Internal Service):

**Check Eligibility:**
```bash
curl -X GET "http://localhost:8089/internal/payments/users/550e8400-e29b-41d4-a716-446655440000/eligibility?estimatedAmount=500"
```

**Process Payment:**
```bash
curl -X POST http://localhost:8089/internal/payments/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.50,
    "orderId": "770e8400-e29b-41d4-a716-446655440002"
  }'
```

---

## Monitoring & Logging

- All payment transactions are logged
- Failed payments generate alerts
- Retry attempts are tracked
- Payment gateway responses logged for debugging
- PCI audit trail maintained

---

## License

Proprietary - Smart Fuel Management System

---

**Last Updated:** May 1, 2026
