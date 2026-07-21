# System Architecture

## Overview

TreeNote follows a Layered Architecture.

```
Angular UI
      │
REST API
      │
Application Layer
      │
Domain Layer
      │
Infrastructure Layer
      │
SQL Server
```

---

## Backend

### Presentation Layer

Responsibilities

- Controllers
- Authentication
- Validation
- HTTP Responses

---

### Application Layer

Responsibilities

- Business logic
- DTOs
- Services
- Interfaces

---

### Domain Layer

Responsibilities

- Entities
- Enums
- Value Objects
- Business Rules

---

### Infrastructure Layer

Responsibilities

- Entity Framework Core
- Repositories
- Identity
- SQL Server

---

## Frontend

```
Pages

↓

Layouts

↓

Components

↓

Services

↓

Models

↓

API
```

Folders

```
core/

shared/

features/

layouts/

pages/

models/

services/
```

---

## Patterns

- Layered Architecture
- Dependency Injection
- Repository Pattern
- Service Pattern
- DTO Pattern

---

## Technologies

Backend

- ASP.NET Core 8
- EF Core
- SQL Server

Frontend

- Angular 21
- Angular Material
- Signals
- RxJS

---

## Security

- JWT
- Refresh Tokens
- Google OAuth

---

## Future

Prepared for

- SignalR
- AI
- Plugins
- Mobile App