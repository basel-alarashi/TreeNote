# Project Roadmap

## Project Information

| Property | Value |
|----------|-------|
| Methodology | Scrum |
| Sprint Duration | 8 - 32 Working hours |
| Total Sprints | 7 (Sprint 0–6) |
| Target Version | 1.0 |

---

# Sprint Overview

| Sprint | Goal | Story Points |
|---------|------|:------------:|
| Sprint 0 | Project Planning & Initial Setup | 8 |
| Sprint 1 | Infrastructure & Application Foundation | 13 |
| Sprint 2 | Core Domain (Workspace, Canvas, Topics & Relationships) | 21 |
| Sprint 3 | Visual Canvas Editor | 34 |
| Sprint 4 | Authentication & User Management | 21 |
| Sprint 5 | Search, Export & Offline Support | 21 |
| Sprint 6 | Performance, Deployment & Final Polish | 18 |

**Estimated Total:** **136 Story Points**

---

# Sprint 0 — Project Planning & Initial Setup

## Goal

Prepare the project for development.

## Deliverables

- Repository initialization
- Solution structure
- Angular workspace
- Documentation
- Git workflow
- Development environment

---

# Sprint 1 — Infrastructure & Application Foundation

## Goal

Build the technical foundation shared by all future features.

## Deliverables

### Backend

- Clean Architecture configuration
- Dependency Injection
- Entity Framework Core
- SQL Server configuration
- ASP.NET Core Identity setup
- Initial DbContext
- Initial migration
- Health Check endpoint
- Logging
- Configuration

### Frontend

- Angular Material
- Angular CDK
- Routing
- Application Shell
- Global Theme

---

# Sprint 2 — Core Domain

## Goal

Implement the application's business model without authentication concerns.

## Deliverables

### Backend

- Workspace entity
- Canvas entity
- Topic entity
- Relationship entity
- Entity configurations
- Business rules
- CRUD APIs
- Database migrations

### Frontend

- Workspace management
- Canvas management
- Topic management (basic)
- Mock authentication (temporary)

---

# Sprint 3 — Visual Canvas Editor

## Goal

Create an interactive editing experience similar to XMind.

## Deliverables

- Infinite canvas
- Topic rendering
- Drag & Drop
- Zoom
- Pan
- Expand / Collapse
- Context menu
- Auto layout
- Keyboard shortcuts
- Undo / Redo (basic)

---

# Sprint 4 — Authentication & User Management

## Goal

Secure the application and associate data with authenticated users.

## Deliverables

### Backend

- JWT Authentication
- Refresh Tokens
- Google OAuth
- Authorization
- User Profile

### Frontend

- Login
- Register
- Google Sign-In
- Route Guards
- HTTP Interceptor
- Profile page

---

# Sprint 5 — Search, Export & Offline Support

## Goal

Improve usability and allow users to work anywhere.

## Deliverables

- Topic search
- Search navigation
- Export to PDF
- Export to PNG
- Offline mode
- Synchronization
- Local caching
- Error handling improvements

---

# Sprint 6 — Performance, Deployment & Final Polish

## Goal

Prepare the application for production and portfolio presentation.

## Deliverables

### Backend

- Performance optimization
- Query optimization
- Logging improvements
- Final API cleanup

### Frontend

- Performance optimization
- Responsive improvements
- Accessibility improvements
- UI polishing

### DevOps

- Docker support
- Production configuration
- CI/CD preparation

### Documentation

- Final README
- API documentation
- Architecture updates
- Release notes

---

# Version 1.0 Completion Criteria

TreeNote 1.0 is considered complete when the following features are available:

- User registration & login
- Google OAuth
- Workspace management
- Canvas management
- Topic management
- Multi-parent relationships (optional)
- Interactive visual editor
- Search
- Export (PDF & PNG)
- Offline support
- Responsive design
- Production-ready deployment

---

# Version 2.0 (Future)

The following features are intentionally postponed:

- Real-time collaboration
- Shared workspaces
- Roles & permissions
- Rich text editing
- Markdown
- Attachments
- Images
- Templates
- Version history
- AI-assisted map generation
- AI topic suggestions
- Public sharing
- Mobile application
- Desktop application
