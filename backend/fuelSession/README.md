# FuelSession Service

Manages individual fuel pump sessions: start, stop, consumption tracking, and session history.

## Overview

- **Port**: 8000
- **Base Path**: `/api/v1/fuel-sessions`
- **Service Name**: FUEL-SESSION
- **Database**: PostgreSQL (fuel_sessions table)

## Features

✅ Fuel session creation (pump activation)  
✅ Real-time consumption tracking  
✅ Session completion (pump deactivation)  
✅ Session history per vehicle  
✅ Consumption analytics  

## API Endpoints

### Protected (User)

```
GET /api/v1/fuel-sessions
  Response: List of user's fuel sessions
  
GET /api/v1/fuel-sessions/{sessionId}
  Response: { id, vehicleId, stationId, startTime, endTime, litersDispensed, amount }
  
POST /api/v1/fuel-sessions/{sessionId}/start
  Response: { sessionId, pumpId, status: "ACTIVE" }
  
POST /api/v1/fuel-sessions/{sessionId}/stop
  Response: { litersDispensed, totalCost }
```

### Internal (Service-to-Service)

```
POST /internal/fuel-sessions
  Request: { userId, vehicleId, stationId }
  Response: { sessionId, pumpId }
  
PATCH /internal/fuel-sessions/{sessionId}
  Request: { litersDispensed, amount, status }
  Response: 204 No Content
```

## Database Schema

```sql
CREATE TABLE fuel_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    station_id UUID NOT NULL,
    pump_id VARCHAR(20),
    liters_dispensed DECIMAL(10,2),
    amount DECIMAL(15,2),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20),  -- ACTIVE, COMPLETED, CANCELLED
    fuel_type VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (station_id) REFERENCES stations(id)
);
```

## Session Lifecycle

```
1. User arrives at pump
   ↓
2. POST /fuel-sessions/start
   → Session created (ACTIVE)
   → Pump hardware notified
   ↓
3. User dispenses fuel
   → Real-time consumption tracked
   ↓
4. User completes (removes pump nozzle)
   ↓
5. POST /fuel-sessions/stop
   → Session completed
   → Final liters & cost recorded
   → Transaction updated
```

## Session Status

- **ACTIVE** - Fuel being dispensed
- **COMPLETED** - Finished, all data recorded
- **CANCELLED** - Session aborted, refund issued

## Integration with Other Services

1. **Transaction Service** - Session linked to transaction
2. **Vehicle Service** - Vehicle validation before session
3. **Station Service** - Pump availability check
4. **Wallet Service** - Charge on session completion

## Running

```bash
cd fuelSession
mvn spring-boot:run
```

Server starts on `http://localhost:8000`

## Configuration

```yaml
server:
  port: 8009
spring:
  application:
    name: FUEL-SESSION
  datasource:
    url: jdbc:postgresql://localhost:5432/fuel_session_db

fuel:
  max-session-duration: 1800  # 30 minutes in seconds
  idle-timeout: 600  # 10 minutes without activity
```

## Hardware Integration

Sessions communicate with physical pump hardware:

```
START: Send pump_id + liters_limit to hardware
STOP: Receive final liters_dispensed from hardware
CANCEL: Stop pump immediately, record partial amount
```

## Analytics

```
GET /api/v1/fuel-sessions/analytics
  Response: {
    totalSessions: 150,
    totalLiters: 3500.50,
    totalSpent: €5250.75,
    averagePerSession: €35.00,
    mostUsedFuelType: "DIESEL"
  }
```

## Running Tests

```bash
mvn test
```

## Dependencies

- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Spring Cloud Eureka
