# Wallet Service

## Overview

The Wallet Service manages user wallet balances, transaction updates, bonus credits, and wallet lifecycle actions.

**Base Path:** `/api/v1/wallet`  
**Service Type:** User-facing, internal, and admin endpoints

## Current Endpoints

### User APIs

#### Get current wallet
`GET /api/v1/wallet`

Returns the authenticated user's wallet.

Response body:
```json
{
  "balance": 125.50,
  "currency": "USD",
  "statusType": "ACTIVE"
}
```

#### Update wallet balance
`POST /api/v1/wallet/update`

Request body:
```json
{
  "amount": 50.00,
  "type": "TOP_UP"
}
```

`type` uses `TransactionType`: `TOP_UP`, `WITHDRAW`, `REFUND`, `BONUS`.

#### Deactivate wallet
`PATCH /api/v1/wallet/deactivate`

Returns `204 No Content`.

### Admin APIs

#### Activate wallet
`PATCH /api/v1/admin/wallet/{userId}/activate`

#### Block wallet
`PATCH /api/v1/admin/wallet/{userId}/block`

### Internal APIs

#### Create wallet
`POST /api/v1/wallet/internal/{userId}`

Used by the User Service during registration.

#### Get wallet by user ID
`GET /api/v1/wallet/internal/{userId}`

#### Update wallet by user ID
`POST /api/v1/wallet/internal/{userId}/update`

Request body:
```json
{
  "amount": 50.00,
  "type": "TOP_UP"
}
```

#### Apply bonus credit
`POST /api/v1/wallet/internal/bonus`

Request body:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 10.00
}
```

#### Delete wallet
`DELETE /api/v1/wallet/internal/{userId}`

## DTOs

### WalletDTO
- `balance`
- `currency`
- `statusType`

### WalletUpdateDTO
- `amount`
- `type`

### WalletBonusDTO
- `userId`
- `amount`

## Notes

- The user-facing controller only exposes wallet read, update, and deactivate actions.
- Wallet creation and bonus application are internal-service operations.
- Admin activation and blocking are handled separately under `/api/v1/admin/wallet`.