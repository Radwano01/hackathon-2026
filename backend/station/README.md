# Station Service

Manages fuel stations, pricing, inventory, and station status. Provides real-time fuel price information.

## Overview

- **Port**: 8000
- **Base Path**: `/api/v1/stations`
- **Service Name**: STATION
- **Database**: PostgreSQL (stations table)

## Features

✅ Station registration (location, pump count)  
✅ Real-time fuel pricing (diesel, regular, premium, electric)  
✅ Station activation/deactivation  
✅ Search stations by city  
✅ Fuel type availability tracking  
✅ Admin station management  

## API Endpoints

### Public (No Auth)

```
GET /api/v1/stations
  Response: List of all active stations
  
GET /api/v1/stations/{stationId}
  Response: { id, name, city, address, pumpCount, status, prices }
  
GET /api/v1/stations/city/{city}
  Response: List of stations in city
  
GET /api/v1/stations/{stationId}/price?fuelType=DIESEL
  Response: { price: 3.45 }
```

### Admin

```
POST /api/v1/admin/stations
  Request: { name, city, address, pumpCount, dieselPrice, regularPrice, premiumPrice, availableFuelTypes }
  Response: { stationId }
  
PATCH /api/v1/admin/stations/{stationId}/activate
  Response: 204 No Content
  
PATCH /api/v1/admin/stations/{stationId}/deactivate
  Response: 204 No Content
```

### Internal (Service-to-Service)

```
GET /internal/stations/{stationId}
  Response: { stationName, city }
```

## Database Schema

```sql
CREATE TABLE stations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    pump_count INT,
    diesel_price DECIMAL(10,2),
    regular_price DECIMAL(10,2),
    premium_price DECIMAL(10,2),
    available_fuel_types VARCHAR(100),  -- comma-separated
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Fuel Types

- **DIESEL** - Diesel fuel
- **REGULAR** - Regular unleaded
- **PREMIUM** - Premium unleaded
- **ELECTRIC** - EV charging (future)

## Pricing Model

Each station has independent pricing:
- Diesel: €/liter
- Regular: €/liter
- Premium: €/liter

Prices updated daily via admin panel.

## Running

```bash
cd station
mvn spring-boot:run
```

Server starts on `http://localhost:8000`

## Configuration

```yaml
server:
  port: 8004
spring:
  application:
    name: STATION
  datasource:
    url: jdbc:postgresql://localhost:5432/station_db
```

## Integration

- **Transaction Service** - Queries station info for transactions
- **FuelSession Service** - Confirms station availability
- **Admin Dashboard** - Station management interface

## Dependencies

- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Spring Cloud Eureka
