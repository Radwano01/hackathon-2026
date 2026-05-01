# Transaction Service

Tracks all fuel purchase transactions, payment status, and financial records. Central audit log for the system.

## Overview

- **Port**: 8040
- **Base Path**: `/api/v1/transactions`
- **Service Name**: TRANSACTION
- **Database**: PostgreSQL (transactions table)

## Features

✅ Transaction creation & tracking  
✅ Real-time status updates  
✅ Transaction history per user  
✅ Payment status reconciliation  
✅ Bonus reward triggering on SUCCESS  
✅ Transaction detail enrichment (station, vehicle info)  

## API Endpoints

### Protected (User)

```
GET /api/v1/transactions
  Response: List of user's transactions
  
GET /api/v1/transactions/{transactionId}
  Response: { id, amount, status, stationName, city, vehiclePlate, createdAt }
```

### Internal (Service-to-Service)

```
POST /internal/transactions/{userId}
  Request: { amount, stationId, vehicleId }
  Response: { id, status, amount }
  
PATCH /internal/transactions/{transactionId}/status?status=SUCCESS|FAILED|PENDING
  Response: 204 No Content
```

## Database Schema

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    vehicle_id UUID,
    station_id UUID,  -- reference to station
    amount DECIMAL(15,2),
    status VARCHAR(20),  -- PENDING, SUCCESS, FAILED
    transaction_type VARCHAR(50),  -- FUEL_PURCHASE, REFUND, BONUS
    plate_number VARCHAR(20),
    payment_method_type VARCHAR(50),
    reference_id UUID,  -- station_id or other reference
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Transaction Status Flow

```
PENDING → (Payment Service)
  ├─→ SUCCESS → Bonus triggered → COMPLETED
  └─→ FAILED → Refund issued → CANCELLED
```

## Transaction Lifecycle

```
1. Created by Payment Service (PENDING)
   ↓
2. User pays via Payment Service
   ↓
3. Status updated to SUCCESS/FAILED
   ↓
4. If SUCCESS:
   → Bonus calculated & applied to wallet
   → Fuel session created
   ↓
5. Transaction enriched with:
   → Station name, city (from Station Service)
   → Vehicle plate number
   → Payment method used
```

## Amount Calculation

Total charge = Fuel cost + (optional) convenience fee
```
Example: €50 fuel @ €1.50/liter
= 50 × 1.50 = €75.00
```

## Running

```bash
cd transaction
mvn spring-boot:run
```

Server starts on `http://localhost:8040`

## Configuration

```yaml
server:
  port: 8008
spring:
  application:
    name: TRANSACTION
  datasource:
    url: jdbc:postgresql://localhost:5432/transaction_db

transaction:
  bonus-percentage: 5  # 5% of amount
```

## Integration

- **Payment Service** → Creates transaction, updates status
- **Wallet Service** → Applies bonus on SUCCESS
- **Station Service** → Enriches with station details
- **Vehicle Service** → Enriches with vehicle info
- **User Service** → Tracks user transaction history

## Business Logic

### On SUCCESS Status Update
1. Transaction marked SUCCESS
2. Calculate bonus = amount × 5%
3. Call Wallet Service to apply bonus
4. Trigger FuelSession creation
5. Notify user

### On FAILED Status Update
1. Transaction marked FAILED
2. Initiate refund if partial charge
3. Update payment method status
4. Notify user

## Reporting

Common queries:
```
GET /api/v1/transactions?status=SUCCESS  -- Successful transactions
GET /api/v1/transactions?from=2024-01-01&to=2024-12-31  -- Date range
GET /api/v1/transactions?sort=amount:desc  -- By amount descending
```

## Dependencies

- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Spring Cloud Eureka
