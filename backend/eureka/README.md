# Eureka Service Discovery

Service registry and discovery server for the microservices architecture. All services register here for dynamic discovery.

## Overview

- **Port**: 8761
- **Role**: Service registration, discovery, health monitoring
- **Type**: Spring Cloud Eureka Server

## Features

✅ Automatic service registration  
✅ Service discovery & load balancing  
✅ Health checking & monitoring  
✅ Dynamic configuration  
✅ Web dashboard at `/` port 8761  

## Configuration

```yaml
eureka:
  server:
    enable-self-preservation: false
    wait-time-in-ms-when-sync-empty: 0
  instance:
    hostname: localhost
```

## Running

```bash
cd eureka
mvn spring-boot:run
```

Eureka Dashboard: `http://localhost:8761`

## Service Registration

Each microservice auto-registers with Eureka (configured in their `application.yml`):
```yaml
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
  instance:
    preferIpAddress: true
```

## Dashboard Features

- **Registered Instances** - View all running services
- **Status** - UP/DOWN/OUT_OF_SERVICE
- **Instances Info** - Port, hostname, metadata
- **Lease Info** - Registration time, renewal time

## Service URLs

Once registered, services are discoverable by name:
```
http://<SERVICE_NAME>/...
Example: http://USER/api/v1/users/...
```

Spring Cloud Load Balancer will route to available instances.

## Health Monitoring

Eureka checks service health via `/actuator/health` endpoint (default every 30 seconds).

Services with failed health checks are marked DOWN and removed from routing.

## Dependencies

- Spring Cloud Eureka Server
