# User Service

## Overview

The User Service manages registration, login, profile access, profile updates, password changes, and password reset requests.

**Base Path:** `/api/v1/users`  
**Service Type:** User-facing and internal endpoints

## Current Endpoints

### Public APIs

#### Register
`POST /api/v1/users/register`

Request body:
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+15551234567",
  "email": "john@example.com",
  "password": "Secret123!"
}
```

Returns `201 Created`.

#### Login
`POST /api/v1/users/login`

Request body:
```json
{
  "phoneNumber": "+15551234567",
  "password": "Secret123!"
}
```

Response body:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### Request password reset
`POST /api/v1/users/password-reset/request?email=john@example.com`

#### Reset password
`POST /api/v1/users/password-reset?token=reset-token&newPassword=Secret123!`

### Authenticated APIs

#### Get current user profile
`GET /api/v1/users`

Response body:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "John Doe",
  "phoneNumber": "+15551234567",
  "wallet": {
    "balance": 0.0,
    "currency": "USD",
    "statusType": "ACTIVE"
  }
}
```

#### Update current user
`PATCH /api/v1/users`

Request body:
```json
{
  "fullName": "John D. Doe",
  "email": "john@example.com",
  "phoneNumber": "+15551234567"
}
```

#### Update password
`PATCH /api/v1/users/password`

Request body:
```json
{
  "oldPassword": "Secret123!",
  "newPassword": "NewSecret123!"
}
```

### Internal APIs

#### Get user response for service-to-service calls
`GET /api/v1/users/internal/{userId}`

Returns:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

## DTOs

### RegisterDTO
- `fullName`
- `phoneNumber`
- `email`
- `password`

### LoginDTO
- `phoneNumber`
- `password`

### AuthDTO
- `userId`
- `token`
- `refreshToken`

### UserDTO
- `id`
- `fullName`
- `phoneNumber`
- `wallet`

### UpdateDTO
- `fullName`
- `email`
- `phoneNumber`

### UpdatePasswordDTO
- `oldPassword`
- `newPassword`

### UserResponse
- `fullName`
- `email`

### CreateWalletRequest
- `userId`

## Notes

- Login uses phone number, not email.
- The current controller exposes the authenticated user at `GET /api/v1/users`, not `/profile`.
- Registration triggers downstream wallet creation through the User Service flow.