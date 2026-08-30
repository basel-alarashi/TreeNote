# Sprint 5 — Search, Export & Offline Support

## Sprint Goal

Improve TreeNote usability and reliability by adding topic search, PNG/PDF export, and offline-first capabilities with synchronization when the connection is restored.

---

# Sprint Scope

1. Search
2. Export
3. Offline Support & Synchronization

---

# Deliverables

## Search

- Search topics by text.
- Search across the user's accessible canvases.
- Display matching topics.
- Navigate to a matching topic on the canvas.
- Highlight the selected search result.
- Support simple case-insensitive and partial matching.

## Export

- Export the current canvas as PNG.
- Export the current canvas as PDF.
- Preserve topic positions, text, emojis, and connectors.
- Provide export controls from the canvas UI.

## Offline Support

- Detect online/offline state.
- Cache recently used canvas data locally.
- Allow editing while offline.
- Store pending changes locally.
- Synchronize changes after reconnecting.
- Handle synchronization failures without losing local changes.
- Show synchronization status.

---

# Packages

## Backend

No mandatory new NuGet packages are required.

Use the existing ASP.NET Core and EF Core infrastructure.

## Frontend

Potential libraries:

- `idb` or the native IndexedDB API for local persistence.
- A PDF generation library if browser-side PDF generation is selected.

Do not add unnecessary overlapping storage libraries.

---

# Recommended Folder Structure

## Backend

```text
Application/

Search/
    DTOs/
    Interfaces/
    Services/

Export/
    DTOs/
    Interfaces/
    Services/

Synchronization/
    DTOs/
    Interfaces/
    Services/
```

```text
Infrastructure/

Persistence/
    Configurations/
    Migrations/

Synchronization/
```

## Frontend

```text
features/

search/
    components/
    models/
    services/

export/
    components/
    models/
    services/

offline/
    models/
    services/
    components/
```

Suggested services:

```text
SearchService
ExportService
OfflineStorageService
SyncService
ConnectivityService
SyncStatusService
```

---

# Stage A — Search

## Tasks

- [ ] Create search UI.
- [ ] Add search input.
- [ ] Implement debounced search input.
- [ ] Create backend search endpoint.
- [ ] Search topics by title/text.
- [ ] Restrict results to the authenticated user's data.
- [ ] Return matching topics with Canvas information.
- [ ] Display search results.
- [ ] Navigate to the selected topic.
- [ ] Center the canvas viewport on the selected topic.
- [ ] Highlight the selected topic.
- [ ] Handle no-results state.
- [ ] Clear search results.

## API

```text
GET /api/v1/search/topics?query={query}
```

Suggested response:

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

## Search Rules

- Case-insensitive.
- Partial text matching.
- Empty queries should not execute a search.
- Search results must respect authorization.
- Search must not expose another user's topics.

---

# Stage B — PNG Export

## Tasks

- [ ] Add Export menu/button to the canvas.
- [ ] Calculate canvas bounds.
- [ ] Render topics and connectors into an exportable representation.
- [ ] Generate PNG.
- [ ] Preserve topic positions.
- [ ] Preserve emojis.
- [ ] Preserve connectors.
- [ ] Add suitable padding.
- [ ] Generate a meaningful filename.
- [ ] Trigger browser download.

Example:

```text
treenote-my-canvas-2026-08-10.png
```

---

# Stage C — PDF Export

## Tasks

- [ ] Add PDF export action.
- [ ] Determine canvas dimensions.
- [ ] Fit the map to the PDF page.
- [ ] Preserve aspect ratio.
- [ ] Preserve topics and connectors.
- [ ] Preserve emojis where supported.
- [ ] Generate a meaningful filename.
- [ ] Trigger browser download.

Example:

```text
treenote-my-canvas-2026-08-10.pdf
```

---

# Stage D — Offline Foundation

## Tasks

- [ ] Detect browser connectivity state.
- [ ] Create IndexedDB storage.
- [ ] Define local canvas data model.
- [ ] Cache opened canvases.
- [ ] Cache topics and relationships.
- [ ] Store local metadata.
- [ ] Display offline status.
- [ ] Display last synchronization time.

Suggested local structure:

```text
IndexedDB

TreeNoteDB
│
├── canvases
├── topics
├── relationships
└── pendingChanges
```

---

# Stage E — Offline Editing

## Tasks

- [ ] Allow cached canvases to open offline.
- [ ] Allow topic creation offline.
- [ ] Allow topic editing offline.
- [ ] Allow topic deletion offline.
- [ ] Allow topic movement offline.
- [ ] Allow relationship creation offline.
- [ ] Allow relationship deletion offline.
- [ ] Save changes locally.
- [ ] Queue unsynchronized operations.

---

# Stage F — Synchronization

## Tasks

- [ ] Detect transition from offline to online.
- [ ] Start synchronization automatically.
- [ ] Send pending changes to the server.
- [ ] Mark successful changes as synchronized.
- [ ] Retry failed synchronization.
- [ ] Prevent duplicate synchronization.
- [ ] Refresh local data after successful synchronization.
- [ ] Display synchronization progress/status.
- [ ] Handle synchronization errors gracefully.

---

# Synchronization Strategy

Use a simple operation-based synchronization model for Sprint 5.

Each pending local operation should contain information similar to:

```text
PendingChange
-------------------------
Id
EntityType
EntityId
OperationType
Payload
CreatedAt
RetryCount
Status
```

Possible operation types:

```text
Create
Update
Delete
```

Example:

```text
EntityType: Topic
EntityId: 123
OperationType: Update
Payload: { title: "Vegetables" }
```

---

# Conflict Strategy

TreeNote currently has no collaboration between users.

Conflicts may still occur when the same user edits the same canvas from multiple devices while one device is offline.

For Sprint 5, use a simple server-version/concurrency approach.

When a conflict occurs:

1. Do not silently overwrite data.
2. Preserve the user's local changes.
3. Report the synchronization conflict.
4. Provide a safe recovery path.

Advanced conflict resolution can be introduced later if required.

---

# Backend Synchronization API

Suggested endpoint:

```text
POST /api/v1/sync
```

Request:

```json
{
  "changes": [
    {
      "entityType": "Topic",
      "entityId": "...",
      "operation": "Update",
      "payload": {}
    }
  ]
}
```

The response should identify:

- Successful operations.
- Failed operations.
- Conflicts.
- Updated server data when necessary.

---

# UI Requirements

The user should always understand the current synchronization state.

Suggested states:

```text
🟢 Online
☁️ Saved
🟠 Saving
📴 Offline
🔄 Syncing
⚠️ Sync Error
```

Avoid displaying technical synchronization details to ordinary users.

---

# Performance Requirements

## Search

- Avoid unnecessary API calls.
- Debounce user input.
- Use server-side searching for large datasets.

## Export

- Do not block the UI unnecessarily.
- Display progress feedback when required.

## Offline

- Avoid unnecessary duplicate local data.
- Keep local storage scoped to the authenticated user's data.

---

# Security Requirements

- Never cache another user's data.
- Clear local user data on logout when appropriate.
- Do not store passwords locally.
- Do not store sensitive authentication credentials in IndexedDB.
- Validate all synchronized changes on the server.
- Never trust locally stored authorization information.
- The server remains the ultimate source of authorization truth.

---

# Definition of Done

## Search

- [ ] User can search for topics.
- [ ] Results are limited to authorized data.
- [ ] Selecting a result navigates to its canvas.
- [ ] Selected topic is centered and highlighted.
- [ ] No-result state works correctly.

## PNG Export

- [ ] Current canvas can be exported as PNG.
- [ ] Topics appear correctly.
- [ ] Connectors appear correctly.
- [ ] Emojis appear correctly where supported.
- [ ] Exported image has appropriate bounds and padding.

## PDF Export

- [ ] Current canvas can be exported as PDF.
- [ ] Canvas fits the PDF page correctly.
- [ ] Topics and connectors are preserved.
- [ ] Export works for reasonably large maps.

## Offline

- [ ] Previously opened canvases can be opened offline.
- [ ] User can edit cached canvases offline.
- [ ] Changes are stored locally.
- [ ] Offline status is visible.

## Synchronization

- [ ] Pending changes synchronize after reconnecting.
- [ ] Failed operations can be retried.
- [ ] Synchronization does not create duplicate operations.
- [ ] Conflicts do not silently destroy local changes.
- [ ] Synchronization status is visible.

## General

- [ ] Existing authentication continues to work.
- [ ] Existing canvas functionality continues to work.
- [ ] No unauthorized data is exposed through search, cache, export, or synchronization.
- [ ] Code is reviewed and merged into `develop`.

---

# Out of Scope

- Real-time collaboration.
- Multiple users editing the same canvas simultaneously.
- Operational Transformation (OT).
- CRDT-based synchronization.
- Advanced conflict merging.
- Rich-text search.
- AI search.
- Public map sharing.
- Cloud file storage.
- Version history.
- Mobile applications.

---

# Sprint Completion Target

At the end of Sprint 5, TreeNote should provide:

```text
                TreeNote
                   │
        ┌──────────┼──────────┐
        │          │          │
      Search     Export    Offline
        │        /    \        │
        │       PNG   PDF      │
        │                       │
        └─────── Canvas ────────┘
```

The application should now be usable as a practical graphical notebook even when the user temporarily loses internet connectivity.
