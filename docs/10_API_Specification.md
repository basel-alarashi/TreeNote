# REST API

Base URL

```
/api/v1/
```

---

## Authentication *(Sprint 4)*

POST

```
/auth/register
```

POST

```
/auth/login
```

POST

```
/auth/google
```

POST

```
/auth/refresh
```

POST

```
/auth/logout
```

All endpoints below now require a valid JWT access token (`Authorization: Bearer <token>`) and enforce resource ownership. `MockCurrentUserService` has been removed; `ICurrentUserService` is implemented by reading the `NameIdentifier` claim from the authenticated principal.

---

## User *(added Sprint 4)*

GET

/users/me

Returns the authenticated user's profile.

PUT

/users/me

Body: `{ "displayName": string }`

PUT

/users/change-password

Body: `{ "currentPassword": string, "newPassword": string }`

**Refresh token behavior:** Refresh tokens rotate on every use — calling `/auth/refresh` returns a new refresh token and revokes the old one. Reusing an already-revoked refresh token revokes *all* active refresh tokens for that user (reuse-detection), forcing re-authentication on every device.

---

## Workspace

GET

```
/workspaces
```
Returns all workspaces owned by the current user.

GET

```
/workspaces/{id}
```

POST

```
/workspaces
```
Body: `{ "name": string }`

PUT

```
/workspaces/{id}
```
Body: `{ "name": string }`

DELETE

```
/workspaces/{id}
```
Cascades: deletes all Canvases, Topics, and Relationships owned by this workspace.

---

## Canvas *(added Sprint 2)*

GET

```
/canvases?workspaceId={workspaceId}
```
`workspaceId` query parameter is required. Returns all canvases in that workspace.

GET

```
/canvases/{id}
```
Returns the full canvas graph in one call: `{ id, workspaceId, name, createdAt, topics: [...], relationships: [...] }` — this is intentional, so the frontend renders a whole map without recursive per-node requests.

POST

```
/canvases
```
Body: `{ "workspaceId": guid, "name": string }`

PUT

```
/canvases/{id}
```
Body: `{ "name": string }`

DELETE

```
/canvases/{id}
```
Cascades: deletes all Topics and Relationships in this canvas.

---

## Topics

GET

```
/topics/{id}
```

POST

```
/topics
```
Body: `{ "canvasId": guid, "title": string, "x": number, "y": number, "emoji": string | null, "parentId": guid | null }`

`parentId: null` creates a root topic. A non-null `parentId` also creates the initial parent→child Relationship automatically.

PUT

```
/topics/{id}
```
Body: `{ "title": string, "x": number, "y": number, "emoji": string | null }`

Covers rename and repositioning ("move," in the drag sense). Re-parenting a topic in the tree is done via the Relationship endpoints below, not here.

```
/topics/positions
```

Body: `{ "id": string, "x": number, "y": number, "rowVersion": string }`

Indepenedent endpoint for changing topic positions with race conditioning support.

DELETE

```
/topics/{id}
```
Also removes any Relationships referencing this topic (as parent or child).

POST

```
/topics/{id}/duplicate
```
*(added Sprint 2 — not in the original spec)* Creates a copy of this topic only (new id, offset position, no relationships copied) — not a recursive subtree clone.

---

## Relationships

POST

```
/relationships
```
Body: `{ "parentId": guid, "childId": guid }`

Rejected with `400` if: `parentId == childId`, the topics are in different canvases, or adding the edge would create a cycle. Rejected with `409` if the relationship already exists. Multiple parents per topic are allowed.

DELETE

```
/relationships
```
Body: `{ "parentId": guid, "childId": guid }` — note this is a body on a DELETE request, since a Relationship's identity is the pair, not a single `{id}`.

---

## Search *(added Sprint 5)*

GET

```
/search/topics?query={query}
```

Response:
```json
[
  {
    "topicId": "...",
    "canvasId": "...",
    "canvasName": "...",
    "title": "...",
    "emoji": "..."
  }
]
```

---

## Export

GET

```
/export/png
```

GET

```
/export/pdf
```

*(Sprint 5 — implemented client-side instead: the canvas SVG is rasterized and downloaded directly in the browser via `ExportService`. No backend endpoints were added; these two routes are not implemented server-side.)*

---

## Synchronization *(added Sprint 5)*

POST

```
/sync
```
Body:
```json
{
  "changes": [
    { "entityType": "Topic" | "Relationship", "entityId": "...", "operation": "Create" | "Update" | "Delete", "payload": {} }
  ]
}
```
Applies queued offline changes in request order. Idempotent: a retried `Create`/`Delete` for an already-applied change returns `Success` rather than erroring or duplicating. `Topic` updates use `RowVersion` for optimistic concurrency; a stale version returns a `Conflict` result carrying the server's current copy instead of overwriting it.

Response:
```json
{
  "results": [
    { "entityId": "...", "entityType": "...", "operation": "...", "status": "Success" | "Failed" | "Conflict", "message": "...", "updatedEntity": {} }
  ]
}
```
`updatedEntity` (Topic changes only) is a flat DTO (`id, canvasId, title, x, y, emoji, createdAt, rowVersion`) — deliberately not the EF entity, which has bidirectional relationship navigation properties that produce a serialization cycle.

---

## HTTP Status

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized (invalid/missing credentials)

403 Forbidden (invalid user, wrong resource)

404 Not Found

409 Conflict

500 Internal Server Error

---

## Error Response Shapes

Two different shapes currently exist, depending on where the error originates:

**Business rule / ownership / not-found errors** (from `ExceptionHandlingMiddleware`, our own exception types):
```json
{ "status": 400, "title": "This relationship would create a cycle." }
```

**Request validation errors** (from ASP.NET's built-in model validation, e.g. `[Required]` on a command):
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "Name": ["The Name field is required."] }
}
```
Both are `application/problem+json`-flavored, but the second is the ASP.NET Core default `ValidationProblemDetails` shape. Worth unifying if this inconsistency becomes annoying — a candidate for Sprint 6 API cleanup.
