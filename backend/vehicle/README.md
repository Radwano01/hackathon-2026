# Vehicle Service

Manages vehicle registration, RFID tracking, and vehicle status for fuel consumption tracking.

## Overview

- **Port**: 8090
- **Base Path**: `/api/v1/vehicles`
- **Service Name**: VEHICLE
- **Database**: PostgreSQL (vehicles table)

## Features

✅ Vehicle registration (car details, fuel type)  
✅ RFID tag assignment for identification  
✅ Vehicle activation/deactivation  
✅ Vehicle validation for fuel sessions  
✅ Plate number & RFID resolution  
✅ Admin vehicle status management  

## API Endpoints

### Public (No Auth)

```
GET /api/v1/vehicles/city/{city}
  Response: List of vehicles in city
```

### Protected (User)

```
POST /api/v1/vehicles
  Request: { plateNumber, brand, model, fuelType }
  Response: { vehicleId }
  
GET /api/v1/vehicles
  Response: List of user's vehicles
  
GET /api/v1/vehicles/{vehicleId}
  Response: { id, plateNumber, brand, model, fuelType, status }
  
PATCH /api/v1/vehicles/{vehicleId}
  Request: { brand, model, fuelType }
  Response: 204 No Content
  
PATCH /api/v1/vehicles/{vehicleId}/deactivate
  Response: 204 No Content
  
GET /api/v1/vehicles/{vehicleId}/validate
  Response: { id, status, fuelType }
```

### Admin

```
PATCH /api/v1/admin/vehicles/{vehicleId}/status
  Query: ?status=ACTIVE|INACTIVE|SUSPENDED
  Response: 204 No Content
  
PATCH /api/v1/admin/vehicles/{plateNumber}/rfid
  Query: ?rfidTag=<tag>
  Response: 204 No Content
  
DELETE /api/v1/admin/vehicles/{vehicleId}
  Response: 204 No Content
  
GET /api/v1/admin/vehicles/plate/{plateNumber}
  Response: { id, plateNumber, brand, model, rfidTag, status }
```

### Internal (Service-to-Service)

```
GET /internal/vehicles/{userId}
  Response: List of user's vehicles
  
GET /internal/vehicles/{userId}/validate
  Response: { id, status, fuelType }
  
GET /internal/vehicles/resolve?rfidTag=<tag>&plateNumber=<plate>
  Response: { vehicleId, userId }
```

## Database Schema

```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    fuel_type VARCHAR(50),
    rfid_tag VARCHAR(50) UNIQUE,
    status VARCHAR(20),  -- ACTIVE, INACTIVE, SUSPENDED
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Vehicle Status

- **ACTIVE** - Ready for fuel sessions
- **INACTIVE** - Deactivated by user
- **SUSPENDED** - Admin suspended (violation/fraud)

## RFID Assignment

RFID tags must be unique. Once assigned, cannot be reassigned.

```
POST /api/v1/admin/vehicles/ABC-1234/rfid?rfidTag=RFID-001
```

## Running

```bash
cd vehicle
mvn spring-boot:run
```

Server starts on `http://localhost:8090`

## Configuration

```yaml
server:
  port: 8003
spring:
  application:
    name: VEHICLE
  datasource:
    url: jdbc:postgresql://localhost:5432/vehicle_db
```

## Dependencies

- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Spring Cloud Eureka
