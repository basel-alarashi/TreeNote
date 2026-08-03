# Database Design

## Tables

### Users *(realized as ASP.NET Core Identity — `AspNetUsers`)*

Sprint 1 replaced the hand-rolled `Users` table originally sketched here with ASP.NET Core Identity's built-in schema (`AspNetUsers`, `AspNetRoles`, `AspNetUserRoles`, etc.), extended by a custom `ApplicationUser` class.

| Column | Type | Notes |
|---------|------|-------|
| Id | uniqueidentifier | Identity's primary key |
| Email | nvarchar | Identity-managed (`NormalizedEmail` also exists) |
| PasswordHash | nvarchar | Identity-managed hashing, not raw storage |
| CreatedAt | datetime | Added via `ApplicationUser : IdentityUser<Guid>` — the one extra column Identity doesn't provide by default |

Identity also adds several columns not listed here (`UserName`, `SecurityStamp`, `ConcurrencyStamp`, lockout fields, etc.) — see `TreeNote.Infrastructure/Identity/ApplicationUser.cs` for the authoritative definition.

---

### Workspaces

| Column | Type |
|---------|------|
| Id | uniqueidentifier |
| UserId | FK → AspNetUsers.Id |
| Name | nvarchar(200) |
| CreatedAt | datetime |

---

### Canvases *(added Sprint 2)*

A Workspace contains one or more Canvases. Each Canvas is an individual concept map (the "document" a user opens and edits) — this sits between Workspace and Topic in the hierarchy.

| Column | Type |
|---------|------|
| Id | uniqueidentifier |
| WorkspaceId | FK → Workspaces.Id |
| Name | nvarchar(200) |
| CreatedAt | datetime |

---

### Topics

| Column | Type | Notes |
|---------|------|-------|
| Id | uniqueidentifier | |
| CanvasId | FK → Canvases.Id | **Changed in Sprint 2** — was `WorkspaceId` in the original design; topics now belong to a Canvas, not directly to a Workspace |
| Title | nvarchar(200) | |
| X | float | |
| Y | float | |
| Emoji | nvarchar(10) | |
| RowVersion | timestamp | **Changed in Sprint 3** — Added for race conditioning in topic positions update | |
| CreatedAt | datetime | |

---

### Relationships

| Column | Type |
|---------|------|
| ParentId | FK → Topics.Id |
| ChildId | FK → Topics.Id |

Composite PK: `ParentId` + `ChildId`

Both FKs use **`Restrict`**, not `Cascade` — SQL Server disallows multiple cascade paths into the same table (both FKs point at `Topics`). Deleting a Topic or a Canvas requires the application to remove any referencing Relationships first; this is handled by `IRelationshipCleanupService` before any delete that touches Topics.

---

### RefreshTokens *(not yet implemented — planned for Sprint 4)*

| Column | Type |
|---------|------|
| Id | uniqueidentifier |
| UserId | FK |
| Token | nvarchar |
| Expiration | datetime |

---

## Relationships (hierarchy)

```
User
│
└── Workspace (1..*)
      │
      └── Canvas (1..*)
            │
            └── Topic (1..*)
                  │
                  └── Relationship (0..*)
```

A Topic's parents/children are derived entirely through `Relationship` rows, not a `ParentId` column on `Topic` — this is what allows optional multi-parent structures and keeps the graph model flexible.

---

## Indexes

Users (AspNetUsers)
- Email (Identity-managed)

Workspaces
- UserId

Canvases
- WorkspaceId

Topics
- CanvasId

Relationships
- ParentId
- ChildId

---

## Business Rules Enforced in Code (not the schema)

- A Relationship cannot connect two Topics in different Canvases.
- A Topic cannot be its own parent.
- Adding a Relationship is rejected if it would create a cycle (checked via graph traversal in `RelationshipService`, not a DB constraint).
- Multiple parents per Topic are permitted — the schema doesn't restrict this, and no application code enforces single-parent.

---

## Notes

A topic does NOT contain ParentId. Relationships are stored separately to support graphs.

`ApplicationUser` (Infrastructure/Identity) is never referenced by Domain entities — `Workspace.UserId` is a plain `Guid`; the FK to `AspNetUsers` is configured entirely inside `ApplicationDbContext`, keeping the Domain layer framework-agnostic.
