# Sprint 3 — Visual Canvas Editor

## Sprint Goal

Transform TreeNote from a CRUD application into a true visual concept-map editor by implementing an interactive canvas with drag-and-drop editing.

---

# Deliverables

## Backend

No major domain changes are expected.

Backend work is limited to:

- Position persistence
- Batch update endpoints
- Layout helper endpoints (optional)
- Validation improvements
- Performance improvements for canvas operations

---

## Frontend

Implement the complete visual editor.

Features include:

- Infinite canvas
- Render topics
- Parent-child connectors
- Drag & Drop
- Pan
- Zoom
- Topic selection
- Multi-selection
- Context menu
- Keyboard shortcuts
- Auto-save
- Undo / Redo (basic)

---

# NPM Packages

Required

- @angular/cdk

Recommended

- ngx-panzoom (optional)

No graph library should be used.

The canvas should be implemented manually using SVG.

---

# Folder Structure

```text
features/

canvas/
│
├── components/
│   ├── canvas/
│   ├── topic/
│   ├── connector/
│   ├── selection-box/
│   ├── context-menu/
│   └── toolbar/
│
├── services/
│   ├── canvas.service.ts
│   ├── viewport.service.ts
│   ├── selection.service.ts
│   ├── history.service.ts
│   └── keyboard.service.ts
│
├── models/
│
└── pages/
```

---

# Sprint Tasks

## Stage A — Canvas Foundation

- [ ] Create CanvasComponent.
- [ ] Render all topics.
- [ ] Render SVG connectors.
- [ ] Render root topics.
- [ ] Load canvas data.

---

## Stage B — Navigation

- [ ] Pan canvas.
- [ ] Zoom in.
- [ ] Zoom out.
- [ ] Mouse wheel zoom.
- [ ] Reset viewport.
- [ ] Fit canvas to screen.

---

## Stage C — Topic Interaction

- [ ] Select topic.
- [ ] Multi-select topics.
- [ ] Drag topics.
- [ ] Persist positions.
- [ ] Highlight selected topics.

---

## Stage D — Connections

- [ ] Draw parent-child connectors.
- [ ] Refresh connectors while dragging.
- [ ] Support multiple parents.
- [ ] Prevent duplicate connector rendering.

---

## Stage E — Context Menu

- [ ] Right-click menu.
- [ ] Add child.
- [ ] Add sibling.
- [ ] Rename topic.
- [ ] Delete topic.
- [ ] Duplicate topic.

---

## Stage F — Keyboard Shortcuts

- [ ] Delete key.
- [ ] F2 Rename.
- [ ] Ctrl + C
- [ ] Ctrl + V
- [ ] Ctrl + Z
- [ ] Ctrl + Y
- [ ] Ctrl + Mouse Wheel

---

## Stage G — History

- [ ] Undo.
- [ ] Redo.
- [ ] History stack.

---

## Stage H — Auto Save

- [ ] Save after drag.
- [ ] Save after rename.
- [ ] Save after deletion.
- [ ] Save after relationship changes.

---

# Backend Tasks

- [ ] Batch update topic positions.
- [ ] Optimize relationship queries.
- [ ] Improve validation.
- [ ] Add optimistic concurrency support.

---

# API

## New Endpoints

PUT

/api/v1/topics/positions

POST

/api/v1/canvas/autosave

GET

/api/v1/canvas/{id}

---

# Definition of Done

- Infinite canvas works.
- Pan works.
- Zoom works.
- Topics are draggable.
- Positions persist after reload.
- Connectors update correctly.
- Context menu works.
- Keyboard shortcuts work.
- Undo/Redo works.
- Auto-save works.
- Canvas remains responsive with approximately 1,000 visible topics.

---