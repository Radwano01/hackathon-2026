# Wallet Service

Manages user digital wallets, balance tracking, transactions, and bonus rewards system.

## Overview

- **Port**: 8010
- **Base Path**: `/api/v1/wallet`
- **Service Name**: WALLET
- **Database**: PostgreSQL (wallets table)

## Features

✅ User wallet creation (on registration)  
✅ Balance management (credits & debits)  
✅ Bonus rewards system (5% cashback on transactions)  
✅ Wallet activation/deactivation  
✅ Admin wallet blocking  
✅ Transaction history with types  

## API Endpoints

### Protected (User)

```
POST /api/v1/wallet
  Response: { walletId }
  
GET /api/v1/wallet
  Response: { balance, currency }
  
POST /api/v1/wallet/update
  Request: { amount, type }  -- type: TOP_UP, WITHDRAW, REFUND, BONUS
  Response: 200 OK
  
PATCH /api/v1/wallet/deactivate
  Response: 204 No Content
```

### Admin

```
PATCH /api/v1/wallet/activate
  Response: 204 No Content
  
PATCH /api/v1/wallet/block
  Response: 204 No Content
  
POST /api/v1/wallet/bonus
  Request: { userId, amount }
  Response: 200 OK
```

### Internal (Service-to-Service)

```
POST /internal/wallet/{userId}
  Response: { walletId }
  
GET /internal/wallet/{userId}
  Response: { balance, currency }
  
POST /internal/wallet/{userId}/update
  Request: { amount, type }
  Response: 200 OK
```

## Database Schema

```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT '$',
    status VARCHAR(20),  -- ACTIVE, INACTIVE, BLOCKED
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Wallet Status

- **ACTIVE** - Operational, can receive & spend
- **INACTIVE** - User deactivated (still exists)
- **BLOCKED** - Admin blocked (fraud/violation)

## Transaction Types

- **TOP_UP** - Manual balance increase
- **WITHDRAW** - Fuel purchase
- **REFUND** - Transaction reversal
- **BONUS** - Reward cashback (5% of fuel cost)

## Bonus System

Automatically triggered after successful fuel transaction:
```
Bonus = Transaction Amount × 5%
Example: €50 fuel → €2.50 bonus
```

## Running

```bash
cd wallet
mvn spring-boot:run
```

Server starts on `http://localhost:8010`

## Configuration

```yaml
server:
  port: 8005
spring:
  application:
    name: WALLET
  datasource:
    url: jdbc:postgresql://localhost:5432/wallet_db

wallet:
  bonus-percentage: 5  # 5% cashback
  currency: "$"
```

## Integration

- **User Service** - Auto-creates wallet on registration
- **Payment Service** - Debits on fuel purchase
- **Transaction Service** - Applies bonuses on SUCCESS
- **Admin Dashboard** - Wallet management

## Dependencies

- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Spring Cloud Eureka
