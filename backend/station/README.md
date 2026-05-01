# Station Service

## Overview

The Station Service manages station lookup, fuel pricing, station creation, and admin activation controls.

**Base Path:** `/api/v1/stations`  
**Service Type:** Public lookup, internal, and admin endpoints

## Current Endpoints

### Public APIs

#### Get station by ID
`GET /api/v1/stations/{id}`

Returns the station entity for the given ID.

#### Get stations by city
`GET /api/v1/stations/city/{city}`

#### Get fuel price for a station
`GET /api/v1/stations/{id}/price?type=DIESEL`

The query parameter name is `type`.

### Admin APIs

#### Create station
`POST /api/v1/admin/stations`

Request body:
```json
{
  "name": "Main Street Station",
  "city": "Nairobi",
  "address": "123 Main Street",
  "pumpCount": 8,
  "dieselPrice": 1.45,
  "regularPrice": 1.62,
  "premiumPrice": 1.80,
  "availableFuelTypes": ["DIESEL", "PETROL", "PREMIUM"]
}
```

#### Activate station
`PATCH /api/v1/admin/stations/{id}/activate`

#### Deactivate station
`PATCH /api/v1/admin/stations/{id}/deactivate`

### Internal APIs

#### Get station details for service-to-service calls
`GET /api/v1/stations/internal/{id}`

Returns:
```json
{
  "stationName": "Main Street Station",
  "city": "Nairobi"
}
```

## DTOs

### CreateStationDTO
- `name`
- `city`
- `address`
- `pumpCount`
- `dieselPrice`
- `regularPrice`
- `premiumPrice`
- `availableFuelTypes`

### StationDTO
- `id`
- `name`
- `city`
- `address`
- `active`
- `pumpCount`
- `availableFuelTypes`
- `dieselPrice`
- `regularPrice`
- `premiumPrice`

### StationResponseDTO
- `stationName`
- `city`

## Notes

- The controller currently exposes station-by-ID, city lookup, and price lookup.
- There is no mapped public list-all endpoint in the current controller.
- Internal station lookups are handled under `/api/v1/stations/internal`.