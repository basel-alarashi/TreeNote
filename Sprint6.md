# Sprint 6 — Performance, Deployment & Final Polish

## Sprint Goal

Prepare TreeNote for production by improving performance, reliability, responsiveness, accessibility, security, deployment readiness, and overall user experience.

This is the final planned sprint for TreeNote v1.0.

---

# Sprint Deliverables

## Performance

- Optimize database queries.
- Optimize API responses.
- Optimize canvas rendering.
- Reduce unnecessary Angular change detection.
- Optimize large canvas handling.
- Reduce unnecessary network requests.
- Implement appropriate lazy loading.
- Review bundle size.
- Add pagination where appropriate.
- Review database indexes.

## Reliability

- Improve global error handling.
- Improve API exception handling.
- Improve frontend error handling.
- Improve offline synchronization recovery.
- Improve logging.
- Add meaningful user-facing error messages.
- Ensure failed operations do not silently lose data.

## Responsive UI

Ensure TreeNote works correctly on desktop, laptop, tablet, and mobile.

Special attention:
- Canvas controls and toolbar.
- Search.
- Workspace navigation.
- Context menus.
- Authentication pages.
- Export controls.

## Accessibility

- Keyboard navigation.
- Focus management.
- Accessible buttons and forms.
- Appropriate labels.
- Tooltips where needed.
- Color contrast.
- Screen-reader-friendly content where practical.

## Security Review

- Review authentication and authorization.
- Review resource ownership checks.
- Review JWT and refresh-token handling.
- Review CORS.
- Review sensitive configuration.
- Review API validation.
- Review local/offline storage.
- Ensure secrets are not committed to Git.

## Deployment

### Backend

- Production configuration.
- Environment variables.
- Database configuration.
- HTTPS configuration.
- Production logging.
- Docker support.

### Frontend

- Production build.
- Environment configuration.
- API URL configuration.
- Production optimization.

## CI/CD

Create a basic GitHub Actions pipeline:

1. Restore dependencies.
2. Build backend.
3. Run backend tests.
4. Build frontend.
5. Run frontend tests.
6. Build production artifacts.

---

# Recommended Folder Structure

## Backend

```text
backend/
│
├── src/
│   ├── TreeNote.Api/
│   ├── TreeNote.Application/
│   ├── TreeNote.Domain/
│   └── TreeNote.Infrastructure/
│
└── tests/
    ├── TreeNote.Api.Tests/
    └── TreeNote.Application.Tests/
```

## Frontend

```text
frontend/
└── src/
    └── app/
        ├── core/
        ├── features/
        ├── layouts/
        ├── models/
        ├── pages/
        ├── services/
        └── shared/
```

No major structural changes should be introduced at this stage.

---

# Stage A — Performance

## Backend

- [ ] Review EF Core queries.
- [ ] Identify N+1 queries.
- [ ] Add missing database indexes.
- [ ] Use projections where appropriate.
- [ ] Avoid loading unnecessary entities.
- [ ] Review pagination.
- [ ] Review API response sizes.
- [ ] Add cancellation tokens where appropriate.
- [ ] Review database connection handling.

## Frontend

- [ ] Review Angular lazy loading.
- [ ] Review component rendering.
- [ ] Reduce unnecessary subscriptions.
- [ ] Use Angular Signals where appropriate.
- [ ] Optimize canvas rendering.
- [ ] Avoid unnecessary DOM updates.
- [ ] Review bundle size.
- [ ] Optimize images/assets.

## Canvas

Target:
- Smooth interaction with approximately 1,000 visible topics.
- Acceptable behavior with large maps approaching the 10,000-topic limit.

If necessary:
- Rendering optimization.
- Viewport culling.
- Reduced connector calculations.
- Batched updates.

---

# Stage B — Reliability & Error Handling

## Backend

- [ ] Implement global exception handling.
- [ ] Return consistent API error responses.
- [ ] Log unexpected exceptions.
- [ ] Avoid exposing internal exception details.
- [ ] Review validation errors.
- [ ] Review concurrency errors.

## Frontend

- [ ] Implement global HTTP error handling.
- [ ] Display useful error messages.
- [ ] Handle expired authentication.
- [ ] Handle network failures.
- [ ] Handle synchronization failures.
- [ ] Handle export failures.
- [ ] Handle unexpected canvas errors.

---

# Stage C — Responsive Design

- [ ] Review desktop layout.
- [ ] Review tablet layout.
- [ ] Review mobile layout.
- [ ] Adapt canvas toolbar.
- [ ] Adapt navigation.
- [ ] Adapt workspace list.
- [ ] Adapt dialogs.
- [ ] Adapt context menus.
- [ ] Ensure touch interaction is usable.
- [ ] Remove horizontal overflow.

---

# Stage D — Accessibility

- [ ] Keyboard navigation works.
- [ ] Interactive elements have accessible names.
- [ ] Forms have labels.
- [ ] Focus states are visible.
- [ ] Dialogs manage focus correctly.
- [ ] Color contrast is acceptable.
- [ ] Tooltips provide useful information.
- [ ] Important status messages are accessible.
- [ ] Canvas controls have keyboard alternatives where practical.

---

# Stage E — Security Review

- [ ] Review JWT expiration.
- [ ] Review refresh-token rotation/revocation.
- [ ] Review authorization checks.
- [ ] Review ownership validation.
- [ ] Review CORS.
- [ ] Review HTTPS requirements.
- [ ] Review production secrets.
- [ ] Review Google OAuth configuration.
- [ ] Review API input validation.
- [ ] Review local storage/IndexedDB contents.
- [ ] Ensure passwords and sensitive credentials are never stored locally.
- [ ] Ensure secrets are excluded from Git.

---

# Stage F — Production Configuration

## Backend

- [ ] Create production configuration.
- [ ] Move secrets to environment variables.
- [ ] Configure production database connection.
- [ ] Configure allowed origins.
- [ ] Configure logging.
- [ ] Configure HTTPS.
- [ ] Configure health checks.
- [ ] Create Dockerfile.
- [ ] Verify production build.

## Frontend

- [ ] Create production environment configuration.
- [ ] Configure production API URL.
- [ ] Build Angular production bundle.
- [ ] Verify routing in production.
- [ ] Verify offline functionality.
- [ ] Verify export functionality.

---

# Stage G — CI/CD

Create:

```text
.github/
└── workflows/
    └── ci.yml
```

Workflow:

```text
Push / Pull Request
        │
        ▼
Build Backend
        │
        ▼
Run Backend Tests
        │
        ▼
Build Frontend
        │
        ▼
Run Frontend Tests
        │
        ▼
Build Production Artifacts
```

Deployment automation is optional depending on the selected hosting provider.

---

# Stage H — Final Portfolio Polish

- [ ] Improve README.
- [ ] Add screenshots.
- [ ] Add architecture diagram.
- [ ] Add feature list.
- [ ] Add setup instructions.
- [ ] Add deployment instructions.
- [ ] Add technology stack.
- [ ] Add project roadmap/status.
- [ ] Add demo link when deployed.
- [ ] Clean unused files.
- [ ] Clean unused dependencies.
- [ ] Remove debugging code.
- [ ] Remove unnecessary console logs.
- [ ] Review Git history.
- [ ] Create v1.0 release.

---

# Stage I — Final Release

## Version

```text
v1.0.0
```

## Release Checklist

- [ ] Production build succeeds.
- [ ] Database migrations succeed.
- [ ] Authentication works.
- [ ] Google OAuth works.
- [ ] Workspace management works.
- [ ] Canvas management works.
- [ ] Topic management works.
- [ ] Relationships work.
- [ ] Multi-parent relationships work.
- [ ] Canvas editor works.
- [ ] Search works.
- [ ] PNG export works.
- [ ] PDF export works.
- [ ] Offline mode works.
- [ ] Synchronization works.
- [ ] Responsive UI works.
- [ ] Accessibility improvements completed.
- [ ] CI pipeline succeeds.
- [ ] Production deployment succeeds.
- [ ] README is complete.

---

# Definition of Done

Sprint 6 is complete when:

- [ ] Application is production-buildable.
- [ ] Critical performance issues are resolved.
- [ ] Critical security issues are resolved.
- [ ] API and frontend error handling are consistent.
- [ ] Application works on desktop, tablet, and mobile.
- [ ] Major accessibility issues are resolved.
- [ ] CI pipeline is operational.
- [ ] Production configuration is complete.
- [ ] Application is deployed successfully.
- [ ] README contains complete project information.
- [ ] v1.0.0 is released.

---

# Out of Scope

The following remain outside TreeNote v1.0:

- Real-time collaboration.
- Shared workspaces.
- Roles and permissions.
- Rich text editing.
- Attachments.
- Public map sharing.
- Version history.
- AI-assisted maps.
- Mobile native application.
- Desktop native application.

These may be considered for a future major version.

---

# Sprint Completion Target

At the end of Sprint 6:

```text
                         TreeNote v1.0
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
     Core                  Visual                 Utility
       │                      │                      │
 Authentication           Canvas                  Search
 Workspace               Drag/Drop                Export
 Topics                  Zoom/Pan                 Offline
 Relationships           Undo/Redo                Sync
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                    Production Ready
                              │
                 ┌────────────┴────────────┐
                 │                         │
              CI/CD                    Deployment
                 │                         │
                 └────────────┬────────────┘
                              │
                           v1.0.0
```

---

# Final Project Goal

TreeNote v1.0 should provide users with a reliable graphical notebook where they can visually organize ideas, connect concepts, search their knowledge, export their maps, and continue working even without an internet connection.

The application should be suitable for:

- Portfolio presentation.
- Technical demonstration.
- GitHub showcase.
- Future feature expansion.
