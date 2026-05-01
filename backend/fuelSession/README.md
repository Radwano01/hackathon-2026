# FuelSession Service

## Overview

The FuelSession Service manages fuel session lifecycle actions such as start, stop, cancel, and user session lookup.

**Base Path:** `/api/v1/fuel-sessions/internal`  
**Service Type:** Internal-only

## Current Endpoints

#### Start fuel session
`POST /api/v1/fuel-sessions/internal/start`

Request body:
```json
{
  "plateNumber": "ABC-1234",
  "rfidTag": "RFID-001",
  "stationId": "550e8400-e29b-41d4-a716-446655440010",
  "pumpId": "550e8400-e29b-41d4-a716-446655440011",
  "fuelType": "DIESEL"
}
```

Response body:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440020",
  "status": "ACTIVE",
  "allowed": true
}
```

#### Stop fuel session
`POST /api/v1/fuel-sessions/internal/{sessionId}/stop`

Request body:
```json
{
  "liters": 42.5,
  "pricePerLiter": 1.45,
  "totalCost": 61.625
}
```

Response body:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440020",
  "vehicleId": "550e8400-e29b-41d4-a716-446655440030",
  "stationId": "550e8400-e29b-41d4-a716-446655440010",
  "transactionId": "550e8400-e29b-41d4-a716-446655440040",
  "fuelType": "DIESEL",
  "liters": 42.5,
  "totalCost": 61.625,
  "status": "COMPLETED",
  "startedAt": "2026-05-01T10:30:00",
  "endedAt": "2026-05-01T10:42:00"
}
```

#### Cancel fuel session
`POST /api/v1/fuel-sessions/internal/{sessionId}/cancel`

Returns `204 No Content`.

#### Get session by ID
`GET /api/v1/fuel-sessions/internal/{sessionId}`

#### Get sessions by user
`GET /api/v1/fuel-sessions/internal/users/{userId}`

## DTOs

### StartFuelSessionDTO
- `plateNumber`
- `rfidTag`
- `stationId`
- `pumpId`
- `fuelType`

### StopFuelSessionDTO
- `liters`
- `pricePerLiter`
- `totalCost`

### FuelSessionStartResponse
- `sessionId`
- `status`
- `allowed`

### FuelSessionDTO
- `sessionId`
- `vehicleId`
- `stationId`
- `transactionId`
- `fuelType`
- `liters`
- `totalCost`
- `status`
- `startedAt`
- `endedAt`

## Notes

- This service is internal-only and is not part of the public API surface.
- It coordinates vehicle, station, transaction, wallet, and payment flows.
- The current controller base path includes `/internal` in the route itself.