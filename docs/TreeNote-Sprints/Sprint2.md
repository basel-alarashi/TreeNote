# Sprint 2 — Core Domain (Workspace, Canvas, Topics & Relationships)

## Sprint Goal

Implement the core business domain of TreeNote independently of authentication.

The objective is to have a fully functional concept-map engine that can be tested using temporary/mock authentication before integrating the real authentication system in Sprint 4.

---

# Deliverables

## Backend

- Create the Workspace entity.
- Create the Canvas entity.
- Create the Topic entity.
- Create the Relationship entity.
- Configure Entity Framework mappings.
- Configure entity relationships.
- Implement business rules.
- Create database migrations.
- Implement CRUD APIs.
- Prevent circular relationships.
- Support optional multi-parent relationships.

---

## Frontend

- Workspace management.
- Canvas management.
- Topic management.
- Temporary mock authentication.
- REST integration with backend.
- Basic error handling.

---

# NuGet Packages

No additional packages are required.

Sprint 1 already installed the required infrastructure packages.

---

# NPM Packages

No additional packages are required.

---

# Folder Structure

## Backend

```text
Application/
│
├── Canvases/
│   ├── Commands/
│   ├── Queries/
│   ├── DTOs/
│   ├── Interfaces/
│   └── Services/
│
├── Workspaces/
│
├── Topics/
│
└── Relationships/

Domain/
│
├── Entities/
│   ├── Workspace.cs
│   ├── Canvas.cs
│   ├── Topic.cs
│   └── Relationship.cs
│
├── Enums/
│
└── Constants/

Infrastructure/
│
├── Persistence/
│
├── Configurations/
│
└── Repositories/ (only if needed)
```

---

## Frontend

```text
features/

workspace/
    pages/
    components/
    services/

canvas/
    pages/
    components/
    services/

topic/
    components/
    services/
```

---

# Sprint Tasks

## Database

- [ ] Create Workspace entity.
- [ ] Create Canvas entity.
- [ ] Create Topic entity.
- [ ] Create Relationship entity.
- [ ] Configure Entity Framework mappings.
- [ ] Configure foreign keys.
- [ ] Create migration.
- [ ] Update database.

---

## Business Logic

- [ ] Workspace CRUD.
- [ ] Canvas CRUD.
- [ ] Topic CRUD.
- [ ] Relationship CRUD.
- [ ] Move topic.
- [ ] Duplicate topic.
- [ ] Validate parent-child relationships.
- [ ] Prevent cyclic graphs.
- [ ] Support optional multi-parent relationships.

---

## API

### Workspace

- [ ] GET /api/v1/workspaces
- [ ] GET /api/v1/workspaces/{id}
- [ ] POST /api/v1/workspaces
- [ ] PUT /api/v1/workspaces/{id}
- [ ] DELETE /api/v1/workspaces/{id}

---

### Canvas

- [ ] GET /api/v1/canvases
- [ ] GET /api/v1/canvases/{id}
- [ ] POST /api/v1/canvases
- [ ] PUT /api/v1/canvases/{id}
- [ ] DELETE /api/v1/canvases/{id}

---

### Topic

- [ ] GET /api/v1/topics/{id}
- [ ] POST /api/v1/topics
- [ ] PUT /api/v1/topics/{id}
- [ ] DELETE /api/v1/topics/{id}

---

### Relationship

- [ ] POST /api/v1/relationships
- [ ] DELETE /api/v1/relationships

---

## Frontend

### Workspace

- [ ] List workspaces.
- [ ] Create workspace.
- [ ] Rename workspace.
- [ ] Delete workspace.

---

### Canvas

- [ ] List canvases.
- [ ] Create canvas.
- [ ] Rename canvas.
- [ ] Delete canvas.

---

### Topics

- [ ] Create topic.
- [ ] Rename topic.
- [ ] Delete topic.
- [ ] Move topic.

---

### Integration

- [ ] Connect frontend to backend APIs.
- [ ] Implement temporary mock authentication.
- [ ] Handle API errors gracefully.

---

# Definition of Done

- Workspace CRUD is fully functional.
- Canvas CRUD is fully functional.
- Topic CRUD is fully functional.
- Relationship CRUD is fully functional.
- Circular relationships are prevented.
- Optional multi-parent relationships work correctly.
- Database migrations execute successfully.
- Swagger documents all endpoints.
- Frontend communicates successfully with the backend.
- All planned code has been reviewed and merged into the `develop` branch.

---
