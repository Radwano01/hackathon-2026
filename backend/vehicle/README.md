# Vehicle Service

## Overview

The Vehicle Service manages vehicle registration, updates, validation, and admin lifecycle actions.

**Base Path:** `/api/v1/vehicles`  
**Service Type:** User-facing, internal, and admin endpoints

## Current Endpoints

### User APIs

#### Register a vehicle
`POST /api/v1/vehicles`

Request body:
```json
{
  "plateNumber": "ABC-1234",
  "brand": "Toyota",
  "model": "Corolla",
  "fuelType": "PETROL"
}
```

Returns `201 Created` with the new vehicle ID.

#### List current user's vehicles
`GET /api/v1/vehicles`

Response body:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "brand": "Toyota",
    "model": "Corolla",
    "status": "ACTIVE"
  }
]
```

#### Get vehicle by ID
`GET /api/v1/vehicles/{vehicleId}`

#### Update vehicle
`PATCH /api/v1/vehicles/{vehicleId}`

Request body:
```json
{
  "brand": "Toyota",
  "model": "Corolla Cross",
  "fuelType": "PETROL"
}
```

#### Deactivate vehicle
`PATCH /api/v1/vehicles/{vehicleId}/deactivate`

#### Validate vehicle
`GET /api/v1/vehicles/{vehicleId}/validate`

### Admin APIs

#### Update vehicle status
`PATCH /api/v1/admin/vehicles/{vehicleId}/status?status=ACTIVE`

#### Assign RFID
`PATCH /api/v1/admin/vehicles/{plateNumber}/rfid?rfidTag=RFID-001`

#### Delete vehicle
`DELETE /api/v1/admin/vehicles/{vehicleId}`

#### Find by plate number
`GET /api/v1/admin/vehicles/plate/{plateNumber}`

### Internal APIs

#### List user vehicles
`GET /api/v1/vehicles/internal/{userId}`

#### Validate by user ID
`GET /api/v1/vehicles/internal/{userId}/validate`

#### Resolve vehicle by RFID and plate number
`GET /api/v1/vehicles/internal/resolve?rfidTag=RFID-001&plateNumber=ABC-1234`

## DTOs

### AddDTO
- `plateNumber`
- `brand`
- `model`
- `fuelType`

### UpdateDTO
- `brand`
- `model`
- `fuelType`

### ListDTO
- `id`
- `brand`
- `model`
- `status`

### VehicleDTO
- `id`
- `plateNumber`
- `brand`
- `model`
- `fuelType`
- `status`
- `createdAt`
- `updatedAt`

### VehicleValidationDTO
- `id`
- `status`
- `fuelType`

### VehicleResponseDTO
- `userId`
- `vehicleId`

## Notes

- The current controller does not expose a public city lookup endpoint.
- Public vehicle actions are authenticated and tied to the current user.
- Admin operations are isolated under `/api/v1/admin/vehicles`.