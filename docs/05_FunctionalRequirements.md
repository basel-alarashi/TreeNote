# Functional Requirements

| Property | Value |
|----------|-------|
| Document | Functional Requirements |
| Version | 1.0 |
| Status | Draft |

---

# 1. Introduction

This document specifies the functional requirements of TreeNote. These requirements describe the behaviors and capabilities that the system shall provide to its users.

---

# 2. Actors

| Actor | Description |
|--------|-------------|
| Guest | A visitor who is not authenticated. |
| User | An authenticated user who owns workspaces and concept maps. |
| Google OAuth Provider | External identity provider used for authentication. |

---

# 3. Functional Requirements

## FR-001 User Registration

**Description**

The system shall allow a guest to create a new account.

**Acceptance Criteria**

- Email must be unique.
- Password must: 1. Have at least 1 uppercase letter. 2. Be at least 8 chars length.
- User profile is created automatically.

---

## FR-002 User Authentication

The system shall allow registered users to authenticate using:

- Email & Password
- Google OAuth

---

## FR-003 Session Management

The system shall:

- Issue JWT access tokens.
- Issue refresh tokens.
- Allow users to sign out.
- Revoke refresh tokens during logout.

---

## FR-004 Workspace Management

The system shall allow authenticated users to:

- Create workspaces.
- Rename workspaces.
- Delete workspaces.
- View all owned workspaces.

A workspace belongs to exactly one user.

---

## FR-005 Topic Management

The system shall allow users to:

- Create root topics.
- Create child topics.
- Rename topics.
- Delete topics.
- Duplicate topics.
- Move topics within a workspace.

---

## FR-006 Topic Relationships

The system shall:

- Maintain parent-child relationships.
- Support multiple root topics.
- Optionally support multiple parents.
- Prevent cyclic relationships.

---

## FR-007 Visual Editor

The system shall provide an interactive canvas allowing users to:

- Drag topics.
- Reorder branches.
- Pan.
- Zoom.
- Expand and collapse branches.

---

## FR-008 Search

The system shall allow users to search for topics by title within the active workspace.

Search results shall:

- Highlight matching topics.
- Navigate the canvas to the selected topic.

---

## FR-009 Export

The system shall allow users to export a concept map as:

- PDF
- PNG

The exported output shall preserve the current visual layout.

---

## FR-010 Offline Support

The application shall continue functioning when the network connection is unavailable.

Users shall be able to:

- Open cached workspaces.
- Edit cached data.
- Synchronize changes when connectivity returns.

---

## FR-011 Responsive Interface

The application shall support:

- Desktop browsers
- Tablets
- Mobile browsers

without losing functionality.

---

## FR-012 User Settings

The system shall allow users to configure:

- Preferred language (future)
- Theme (future)
- Default workspace (future)

Version 1 requires only the infrastructure to support future settings.

---

## FR-013 Display Name *(added Sprint 4)*

The system shall allow authenticated users to set and update a display name, separate from their email address.

---

# 4. Business Rules

BR-001

Each workspace belongs to one user.

---

BR-002

Users cannot access workspaces owned by other users.

---

BR-003

A workspace may contain multiple root topics.

---

BR-004

Every topic belongs to exactly one workspace.

---

BR-005

Relationships cannot create cycles.

---

BR-006

Deleted workspaces permanently remove their topics and relationships.

(Soft delete may be introduced in a future version.)

---

# 5. Assumptions

- Internet connectivity is normally available.
- Google OAuth service is operational.
- Browsers support modern JavaScript features.
- JavaScript is enabled.

---

# 6. Constraints

- Backend: ASP.NET Core 8
- Frontend: Angular 21
- Database: SQL Server
- REST API architecture
- JWT authentication
- Responsive design

---

# 7. Functional Requirement Traceability

| Requirement | Epic |
|-------------|------|
| FR-001 | Authentication |
| FR-002 | Authentication |
| FR-003 | Authentication |
| FR-004 | Workspace Management |
| FR-005 | Topic Management |
| FR-006 | Relationships |
| FR-007 | Visual Editor |
| FR-008 | Search |
| FR-009 | Export |
| FR-010 | Offline Support |
| FR-011 | Responsive Design |
| FR-012 | Settings |

---

# 8. Future Functional Requirements

The following are intentionally excluded from Version 1:

- Collaboration
- Shared workspaces
- Comments
- Attachments
- Rich text
- Markdown
- AI assistance
- Notifications
- Version history
- Public sharing