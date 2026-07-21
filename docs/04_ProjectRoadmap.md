# Project Roadmap

Project Name: TreeNote (Working Title)

Technology Stack
----------------
Backend:
- ASP.NET Core 8 Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
- Google OAuth

Frontend:
- Angular 21
- TypeScript
- Angular Material
- Angular Signals
- RxJS
- Angular CDK

Architecture
------------
- Layered Architecture
- REST API
- Repository + Service Pattern
- Entity Framework Core
- SQL Server

==========================================================
SPRINT 0
==========================================================

Goal
----
Prepare the project architecture before writing code.

Deliverables
------------
- Project vision
- Functional requirements
- Non-functional requirements
- User stories
- Database design
- API specification
- Architecture
- Naming conventions (Glossary)
- Product Backlog

Tasks
-----
- [  ] Define project scope
- [  ] Identify actors
- [  ] Define use cases
- [  ] Design database
- [  ] Design REST API
- [  ] Define architecture
- [  ] Prepare Git repository
- [  ] Create solution structure
- [  ] Create Angular workspace
- [  ] Configure Swagger

Acceptance Criteria
-------------------
- Everyone understands project goals
- Architecture approved
- Database approved
- API approved

==========================================================
SPRINT 1
==========================================================

Goal
----
Authentication and Workspace Management.

Features
--------
- Register
- Login
- JWT
- Google OAuth
- Refresh Token
- Workspace CRUD
- User Profile

Tasks
-----
- [  ] ASP.NET Identity
- [  ] JWT Authentication
- [  ] Google OAuth
- [  ] Refresh Tokens
- [  ] Angular Authentication
- [  ] Route Guards
- [  ] Workspace CRUD API
- [  ] Workspace UI
- [  ] User Profile

Acceptance Criteria
-------------------
User can:
- Register
- Login
- Logout
- Create Workspace
- Rename Workspace
- Delete Workspace

==========================================================
SPRINT 2
==========================================================

Goal
----
Tree Management.

Features
--------
- Root Topics
- Child Topics
- Edit Topic
- Delete Topic
- Expand/Collapse

Tasks
-----
- [  ] Topic entity
- [  ] Relationship entity
- [  ] CRUD API
- [  ] Recursive loading
- [  ] Lazy loading
- [  ] Validation
- [  ] Angular Tree Service
- [  ] Topic Components

Acceptance Criteria
-------------------
User can create and manage complete trees.

==========================================================
SPRINT 3
==========================================================

Goal
----
Visual Mind Map Editor.

Features
--------
- XMind-like canvas
- Drag & Drop
- Pan
- Zoom
- Auto layout

Tasks
-----
- [  ] Canvas
- [  ] Drag topics
- [  ] Move subtrees
- [  ] Zoom
- [  ] Pan
- [  ] Auto arrange
- [  ] Keyboard shortcuts
- [  ] Context menu

Acceptance Criteria
-------------------
User can visually edit trees naturally.

==========================================================
SPRINT 4
==========================================================

Goal
----
Improve User Experience.

Features
--------
- Search
- Responsive UI
- Offline support
- Emoji picker
- Settings

Tasks
-----
- [  ] Search
- [  ] Responsive layouts
- [  ] IndexedDB storage
- [  ] Service Worker
- [  ] Sync mechanism
- [  ] Emoji picker
- [  ] Preferences

Acceptance Criteria
-------------------
Application works smoothly on desktop and mobile.

==========================================================
SPRINT 5
==========================================================

Goal
----
Export and Performance.

Features
--------
- Export PDF
- Export PNG
- Performance optimization

Tasks
-----
- [  ] PDF export
- [  ] PNG export
- [  ] Optimize SQL
- [  ] Optimize Angular rendering
- [  ] Caching
- [  ] Loading indicators

Acceptance Criteria
-------------------
Large trees remain responsive.
Exported files match the visual map.

==========================================================
SPRINT 6
==========================================================

Goal
----
Production Readiness.

Features
--------
- Deployment
- CI/CD
- Documentation
- Portfolio

Tasks
-----
- [  ] Docker
- [  ] Environment configuration
- [  ] Logging
- [  ] Global exception handling
- [  ] README
- [  ] Screenshots
- [  ] Demo video
- [  ] Deployment
- [  ] Portfolio write-up

Acceptance Criteria
-------------------
Application is production-ready and publicly accessible.

==========================================================
FUTURE FEATURES
==========================================================

Version 2
----------
- Collaboration
- SignalR
- Shared Workspaces
- Comments
- Version History
- Markdown
- Images
- Attachments
- Tags
- Templates
- AI-generated maps
- Import/Export JSON
- Public sharing
- Dark Mode
- Themes
- Multi-language