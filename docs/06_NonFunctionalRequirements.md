# Non-Functional Requirements

| Property | Value |
|----------|-------|
| Document | Non-Functional Requirements |
| Version | 1.0 |
| Status | Draft |

---

# 1. Introduction

This document defines the quality attributes and technical constraints of the TreeNote application. These requirements ensure that the system is secure, performant, maintainable, scalable, and user-friendly.

---

# 2. Performance

## NFR-PERF-001

The application shall load the dashboard within **2 seconds** under normal network conditions.

---

## NFR-PERF-002

API requests shall respond within:

- Average: **< 300 ms**
- Maximum: **< 1 second**

excluding external services.

---

## NFR-PERF-003

The system shall support at least:

- 10,000 topics per workspace
- 500 workspaces per user

without noticeable UI degradation.

---

## NFR-PERF-004

Canvas interactions (drag, zoom, pan) shall remain smooth at approximately **60 FPS** on modern desktop browsers.

---

# 3. Security

## NFR-SEC-001

Passwords shall never be stored in plain text.

---

## NFR-SEC-002

Authentication shall use JWT Access Tokens and Refresh Tokens.

---

## NFR-SEC-003

Google OAuth authentication shall use OAuth 2.0.

---

## NFR-SEC-004

Every API endpoint requiring authentication shall validate ownership of requested resources.

---

## NFR-SEC-005

HTTPS shall be required in production.

---

# 4. Scalability

## NFR-SCAL-001

The architecture shall support horizontal expansion without requiring application redesign.

---

## NFR-SCAL-002

Database schema shall support future collaboration features.

---

## NFR-SCAL-003

Topic relationships shall support optional graph structures.

---

# 5. Availability

## NFR-AVL-001

The application shall continue operating in Offline Mode for previously synchronized workspaces.

---

## NFR-AVL-002

Unsynchronized changes shall be preserved until synchronization succeeds.

---

# 6. Reliability

## NFR-REL-001

Unexpected client errors shall not cause data loss.

---

## NFR-REL-002

Server exceptions shall be logged.

---

## NFR-REL-003

The system shall gracefully recover after temporary network failures.

---

# 7. Usability

## NFR-USE-001

The user interface shall remain consistent across all pages.

---

## NFR-USE-002

New users shall be able to create their first concept map without documentation.

---

## NFR-USE-003

The interface shall be responsive for desktop, tablet, and mobile devices.

---

## NFR-USE-004

Frequently used actions should require as few interactions as practical.

---

# 8. Accessibility

## NFR-ACC-001

Interactive elements shall be keyboard accessible where practical.

---

## NFR-ACC-002

The interface should maintain sufficient color contrast.

---

## NFR-ACC-003

Icons should include descriptive tooltips or labels where appropriate.

---

# 9. Maintainability

## NFR-MAIN-001

The backend shall follow a layered architecture.

---

## NFR-MAIN-002

Business logic shall not reside in controllers.

---

## NFR-MAIN-003

The frontend shall follow Angular style guidelines.

---

## NFR-MAIN-004

Every public API endpoint shall be documented in Swagger.

---

# 10. Portability

## NFR-PORT-001

The application shall run on all modern Chromium-based browsers and Firefox.

---

## NFR-PORT-002

Backend deployment shall support Docker containers.

---

# 11. Compatibility

The application shall support:

- ASP.NET Core 8
- Angular 21
- SQL Server 2022

---

# 12. Logging

The application shall log:

- Authentication failures
- Unhandled exceptions
- Critical application errors

Sensitive user data shall never be written to logs.

---

# 13. Backup

The database shall support scheduled backup and restore procedures.

---

# 14. Coding Standards

The project shall follow:

- SOLID principles
- Clean Code practices
- Dependency Injection
- Repository pattern (where appropriate)
- RESTful API conventions

---

# 15. Future-Proofing

The architecture shall allow future implementation of:

- SignalR collaboration
- AI-assisted features
- Plugin support
- Rich content
- Mobile applications