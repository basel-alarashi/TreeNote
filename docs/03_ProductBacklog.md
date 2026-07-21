# Product Backlog

## Project Information

Project: TreeNote

Methodology: Scrum

Sprint Length: 2 Weeks

Priority Legend

- 🔴 Critical
- 🟠 High
- 🟡 Medium
- ⚪ Low

---

# Epic 1 — Authentication

Priority: 🔴 Critical

## Features

- User Registration
- Login
- Logout
- Google OAuth
- JWT Authentication
- Refresh Tokens
- User Profile

---

### User Stories

- Register with email and password.
- Sign in securely.
- Authenticate using Google.
- Stay logged in using refresh tokens.
- Update profile information.

---

# Epic 2 — Workspace Management

Priority: 🔴 Critical

## Features

- Create Workspace
- Rename Workspace
- Delete Workspace
- List Workspaces

---

### User Stories

- Create a new workspace.
- Rename an existing workspace.
- Delete a workspace.
- View all owned workspaces.

---

# Epic 3 — Topic Management

Priority: 🔴 Critical

## Features

- Create Topic
- Edit Topic
- Delete Topic
- Move Topic
- Duplicate Topic
- Expand/Collapse
- Multiple Root Topics

---

### User Stories

- Create root topics.
- Create child topics.
- Rename topics.
- Delete topics.
- Move topics.
- Expand or collapse branches.

---

# Epic 4 — Relationships

Priority: 🟠 High

## Features

- Parent/Child Relationship
- Multi-parent Relationship (Optional)
- Relationship Validation

---

### User Stories

- Connect topics.
- Disconnect topics.
- Allow optional multiple parents.
- Prevent invalid graph structures (cycles).

---

# Epic 5 — Visual Editor

Priority: 🔴 Critical

## Features

- Interactive Canvas
- Drag & Drop
- Zoom
- Pan
- Auto Layout
- Context Menu

---

### User Stories

- Move topics visually.
- Navigate large concept maps.
- Arrange nodes automatically.

---

# Epic 6 — Search

Priority: 🟠 High

## Features

- Instant Search
- Highlight Results
- Navigate to Topic

---

### User Stories

- Search by topic title.
- Jump directly to matching topics.

---

# Epic 7 — Export

Priority: 🟡 Medium

## Features

- Export PDF
- Export PNG

---

### User Stories

- Export the visible concept map as PDF.
- Export the concept map as PNG.

---

# Epic 8 — Offline Support

Priority: 🟠 High

## Features

- Offline Cache
- Local Storage
- Synchronization

---

### User Stories

- Continue editing without internet.
- Synchronize changes when back online.

---

# Epic 9 — Responsive Design

Priority: 🟠 High

## Features

- Desktop Layout
- Tablet Layout
- Mobile Layout

---

### User Stories

- Use the application comfortably on any supported screen size.

---

# Epic 10 — Performance

Priority: 🟡 Medium

## Features

- Lazy Loading
- Efficient Rendering
- Database Optimization
- Caching

---

### User Stories

- Open large concept maps quickly.
- Maintain smooth interactions with up to 10,000 topics.

---

# Epic 11 — Deployment

Priority: ⚪ Low

## Features

- Docker
- Environment Configuration
- Production Deployment

---

### User Stories

- Deploy the application to a production environment.
- Support environment-specific configuration.

---

# Epic 12 — Documentation

Priority: 🟡 Medium

## Features

- API Documentation
- Architecture Documentation
- Database Documentation
- README
- Portfolio Guide

---

### User Stories

- Understand how to install and use the project.
- Understand the architecture and design decisions.

---

# Future Backlog (Version 2+)

## Collaboration

- Shared Workspaces
- Invitations
- Roles
- Permissions
- SignalR

---

## Rich Content

- Markdown
- Images
- Attachments
- Hyperlinks
- Checklists

---

## AI

- AI-generated Maps
- Topic Suggestions
- Auto Organization
- Summarization

---

## Advanced Features

- Templates
- Themes
- Dark Mode
- Version History
- Public Sharing
- Comments
- Tags
- Favorites
- Import/Export JSON
- Graph Analytics

---

# Backlog Prioritization

## Must Have (MVP)

- Authentication
- Workspaces
- Topic Management
- Relationships
- Visual Editor
- Search
- Export
- Responsive Design

---

## Should Have

- Offline Support
- Performance Improvements
- Documentation

---

## Could Have

- Docker
- Deployment Automation

---

## Won't Have (Version 1)

- Collaboration
- AI
- Attachments
- Markdown
- Rich Text
- Comments

---

# Epic Estimation

| Epic | Priority | Story Points | Planned Sprint |
|------|:--------:|:------------:|:--------------:|
| Authentication | 🔴 Critical | 13 | Sprint 1 |
| Workspace Management | 🔴 Critical | 8 | Sprint 1 |
| Topic Management | 🔴 Critical | 21 | Sprint 2 |
| Relationships | 🟠 High | 8 | Sprint 2 |
| Visual Editor | 🔴 Critical | 34 | Sprint 3 |
| Search | 🟠 High | 5 | Sprint 4 |
| Offline Support | 🟠 High | 13 | Sprint 4 |
| Responsive Design | 🟠 High | 5 | Sprint 4 |
| Export | 🟡 Medium | 8 | Sprint 5 |
| Performance Optimization | 🟡 Medium | 8 | Sprint 5 |
| Deployment | ⚪ Low | 5 | Sprint 6 |
| Documentation | 🟡 Medium | 8 | Sprint 6 |

---

## Project Statistics

| Metric | Value |
|---------|------:|
| Number of Epics | 12 |
| Estimated Story Points | **136 SP** |
| Sprint Count | 7 (Sprint 0–6) |
| Sprint Duration | 2 Weeks |
| Estimated Development Time | 14 Weeks |
| Estimated Documentation & Polish | 2 Weeks |
| Total Project Duration | **Approximately 16 Weeks** |

---

## MVP Scope

The following epics are required for Version 1.0:

- ✅ Authentication
- ✅ Workspace Management
- ✅ Topic Management
- ✅ Relationships
- ✅ Visual Editor
- ✅ Search
- ✅ Offline Support
- ✅ Responsive Design
- ✅ Export
- ✅ Performance Optimization

The following epics are considered post-MVP:

- Deployment
- Documentation Improvements
- Collaboration
- AI Features
- Rich Content