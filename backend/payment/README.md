# Payment Service

Handles payment processing with Stripe integration. Manages multi-method payment workflows (wallet, card, etc).

## Overview

- **Port**: 8100
- **Base Path**: `/api/v1/payments`
- **Service Name**: PAYMENT
- **Payment Gateway**: Stripe

## Features

✅ Multi-method payment (wallet, card, etc)  
✅ Stripe card payment integration  
✅ Automatic payment method prioritization  
✅ Transaction creation & status tracking  
✅ Bonus reward triggering on success  
✅ Fallback payment method support  

## API Endpoints

### Protected (User)

```
POST /api/v1/payments
  Request: { amount, orderId, stationId }
  Response: { transactionId, status, amount }
```

### Internal (Service-to-Service)

```
POST /internal/payments/{userId}
  Request: { amount, orderId }
  Response: { transactionId, status, amount }
```

## Payment Flow

```
1. User initiates payment
   ↓
2. Create transaction (PENDING)
   ↓
3. Fetch user's payment methods (sorted by priority)
   ↓
4. Try payment methods in order:
   a) Wallet → Debit balance
   b) Card → Charge via Stripe
   c) Next method...
   ↓
5. If successful: Update transaction to SUCCESS
   → Trigger bonus reward
   ↓
6. If all fail: Update transaction to FAILED
   → Refund any partial charges
```

## Payment Methods

Each user can have multiple payment methods with priority ranking:

- **WALLET** - Instant, no commission
- **CARD** - Via Stripe (2.9% + $0.30)
- **BANK_TRANSFER** - Future
- **MOBILE_PAYMENT** - Future

## Stripe Integration

```yaml
stripe:
  secret-key: sk_test_xxxxx  # From environment
  publishable-key: pk_test_xxxxx
```

### Stripe Request

```
POST https://api.stripe.com/v1/payment_intents
  amount: 5000  # cents
  currency: usd
  payment_method: pm_xxxxx
  confirm: true
```

### Response

```
{
  "id": "pi_xxxxx",
  "status": "succeeded",
  "amount_received": 5000
}
```

## Database Schema

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    transaction_id UUID,
    amount DECIMAL(15,2),
    status VARCHAR(20),  -- PENDING, SUCCESS, FAILED
    payment_method VARCHAR(50),  -- WALLET, CARD, etc
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Configuration

```yaml
server:
  port: 8006
spring:
  application:
    name: PAYMENT
    
stripe:
  secret-key: ${STRIPE_SECRET_KEY}
  publishable-key: ${STRIPE_PUBLISHABLE_KEY}
```

## Running

```bash
cd payment
mvn spring-boot:run
```

Server starts on `http://localhost:8100`

## Integration Flow

1. **User initiates payment** → API call
2. **Creates transaction** → Transaction Service (`/internal/transactions/...`)
3. **Fetches payment methods** → PaymentMethod Service (`/internal/payment-methods/...`)
4. **Processes payment** → Stripe API OR Wallet Service
5. **Updates transaction status** → Transaction Service
6. **Applies bonus** → Wallet Service (if SUCCESS)

## Error Handling

- **Insufficient balance** → Try next payment method
- **Card declined** → Try next payment method
- **All methods failed** → Set transaction to FAILED
- **Stripe timeout** → Retry logic

## Running Tests

```bash
mvn test
```

## Security Considerations

1. **Never log card tokens**
2. **Use HTTPS only**
3. **Validate amounts server-side**
4. **Use Stripe webhooks for confirmations**
5. **Store Stripe keys in environment variables**

## Dependencies

- Spring Web
- Stripe Java SDK (stripe-java:26.0.0)
- Spring Data JPA
- PostgreSQL Driver
- Spring Cloud Eureka
