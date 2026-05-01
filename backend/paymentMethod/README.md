# PaymentMethod Service

Manages user payment methods: credit cards, wallet configuration, and payment preferences.

## Overview

- **Port**: 8020
- **Base Path**: `/api/v1/payment-methods`
- **Service Name**: PAYMENT-METHOD
- **Database**: PostgreSQL (payment_methods table)

## Features

✅ Card registration & tokenization (Stripe)  
✅ Default payment method selection  
✅ Payment method priority ranking  
✅ Card deletion & management  
✅ Payment method validation  

## API Endpoints

### Protected (User)

```
POST /api/v1/payment-methods/cards
  Request: { cardNumber, expiryMonth, expiryYear, cvc, holderName }
  Response: { methodId, lastFourDigits }
  
GET /api/v1/payment-methods
  Response: List of user's payment methods
  
DELETE /api/v1/payment-methods/{methodId}
  Response: 204 No Content
  
PATCH /api/v1/payment-methods/{methodId}/default
  Response: 204 No Content
```

### Internal (Service-to-Service)

```
GET /internal/payment-methods/{userId}
  Response: List of payment methods (sorted by priority)
  
GET /internal/payment-methods/{userId}/default
  Response: { id, type, lastFourDigits, isDefault }
```

## Database Schema

```sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    payment_method_type VARCHAR(50),  -- WALLET, CARD, BANK_TRANSFER
    card_token VARCHAR(255),  -- Stripe token
    last_four_digits VARCHAR(4),
    holder_name VARCHAR(255),
    is_default BOOLEAN DEFAULT false,
    priority INT DEFAULT 0,  -- Lower number = higher priority
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Payment Method Types

- **WALLET** - Digital wallet (auto-created for all users)
- **CARD** - Credit/debit card (via Stripe)
- **BANK_TRANSFER** - Direct bank (future)
- **MOBILE_PAYMENT** - Apple Pay/Google Pay (future)

## Stripe Card Tokenization

Cards are never stored directly. Instead:
1. Card details sent to Stripe
2. Stripe returns token (e.g., `pm_xxxxx`)
3. Only token stored in database
4. Stripe handles PCI compliance

## Priority System

Lower number = higher priority in payment attempts:
```
Priority 0 → Wallet (always first)
Priority 1 → Default card
Priority 2 → Secondary cards
```

## Running

```bash
cd paymentMethod
mvn spring-boot:run
```

Server starts on `http://localhost:8020`

## Configuration

```yaml
server:
  port: 8007
spring:
  application:
    name: PAYMENT-METHOD
  datasource:
    url: jdbc:postgresql://localhost:5432/payment_method_db

stripe:
  secret-key: ${STRIPE_SECRET_KEY}
```

## Card Validation

- **Format**: Luhn algorithm check
- **Expiry**: Not expired
- **CVC**: 3-4 digits

## Integration

- **Payment Service** - Fetches user's payment methods for processing
- **User Service** - Creates default wallet on registration
- **Wallet Service** - Manages wallet as payment method

## Security

1. **PCI Compliance** - Never handle raw card data
2. **Tokenization** - Use Stripe tokens only
3. **Encryption** - All card tokens encrypted at rest
4. **HTTPS** - Required for all card operations

## Dependencies

- Spring Web
- Spring Data JPA
- Stripe Java SDK
- PostgreSQL Driver
- Spring Security
- Spring Cloud Eureka
