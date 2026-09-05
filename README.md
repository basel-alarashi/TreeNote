# TreeNote 🌳

> A modern visual knowledge management application for organizing ideas using interactive concept maps.

![.NET](https://img.shields.io/badge/.NET-10-purple)
![Angular](https://img.shields.io/badge/Angular-21-red)
![SQL%20Server](https://img.shields.io/badge/SQL%20Server-2022-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-In%20Development-orange)

**[Live Demo →](https://treenote-1.onrender.com)** *(hosted on a free tier — the backend sleeps after 15 minutes idle; the first request may take up to a minute to wake it)*

---

## 📖 Overview

TreeNote is a full-stack web application that enables users to organize information visually through hierarchical concept maps.

Instead of storing notes as plain text, TreeNote lets users build structured knowledge using connected topics, making brainstorming, planning, and learning more intuitive.

This project is being developed as a portfolio-quality application following Agile/Scrum practices (7 sprints) and modern software engineering principles.

---

## ✨ Features

### Version 1.0


- 🔐 JWT authentication with rotating, httpOnly-cookie-backed refresh tokens
- 🔑 Google OAuth
- 👤 User Profiles
- 📂 Workspace and canvas management
- 🌳 Tree-based Concept Maps
- 🖱️ Interactive SVG canvas: drag & drop, pan, zoom, viewport culling for large maps, undo/redo, touch support, full keyboard accessibility
- 🔍 Debounced topic search with keyboard navigation
- 📄 Export to PDF
- 🖼️ Export to PNG
- 📱 Responsive Design
- 📶 Offline Support (editing with IndexedDB caching and background sync)

### Planned Features

- 👥 Collaboration
- 🤖 AI-assisted Mind Maps
- 📝 Markdown & rich text support
- 🖼️ Images & Attachments
- 🏷️ Tags
- 🌙 Dark Theme
- 📚 Templates
- 🔄 Version History

---

# 🏗️ Architecture

```
                Angular 21

                     │

             REST API (.NET 10)

                     │

          Application Layer

                     │

             Domain Layer

                     │

         Infrastructure Layer

                     │

              SQL Server 2022
```

---

# 🛠️ Technology Stack

## Backend

- ASP.NET Core 10
- Entity Framework Core
- SQL Server 2022
- JWT Authentication
- Google OAuth
- Serilog (structured logging)

## Frontend

- Angular 21
- TypeScript
- Angular Material
- Angular Signals
- RxJS
- Angular CDK

## Tools

- Git
- GitHub
- Github Actions (CI)
- Swagger
- Docker
- Visual Studio 2026

---

**Deployment topology:** Angular static build on Render Static Site → ASP.NET Core API in a Docker container on Render Web Service → SQL Server database hosted remotely. Frontend and backend share a registrable domain (`*.onrender.com`), which keeps the refresh-token cookie's `SameSite=Strict` policy working across both without relaxing it.

---

# 📁 Repository Structure

```
TreeNote/

├── backend/
├── frontend/
├── database/
├── docs/
├── assets/
├── scripts/
└── README.md
```

---

# 🚀 Development Roadmap

| Sprint | Goal | Status |
|---------|------|:------:|
| Sprint 0 | Project Planning & Initial Setup | ✅ Done |
| Sprint 1 | Infrastructure & Application Foundation | ✅ Done |
| Sprint 2 | Core Domain (Workspace, Canvas, Topics & Relationships) | ✅ Done |
| Sprint 3 | Visual Canvas Editor | ✅ Done |
| Sprint 4 | Authentication & User Management | ✅ Done |
| Sprint 5 | Search, Export & Offline Support | ✅ Done |
| Sprint 6 | Performance, Deployment & Final Polish | ✅ Done |

---

# 📚 Documentation

Project documentation is available in the `docs/` directory.

- Project Vision
- Product Backlog
- Functional Requirements
- Non-functional Requirements
- Architecture
- Database Design
- API Specification

---

# 🤝 Development Workflow

This project follows Scrum with sprint-based iterations.

Each sprint includes:

- Sprint Goal
- Sprint Backlog
- Development
- Code Review
- Sprint Review
- Sprint Retrospective

---

# 🎯 Project Goals

- Practice enterprise-level ASP.NET Core development.
- Build a production-quality Angular application.
- Apply Clean Architecture principles.
- Learn Agile software development.
- Demonstrate scalable software design.
- Create a portfolio-ready project.

---

# 📈 Current Status

**Current Version:** `v1.0.0`

**Current Sprint:** `All 7 sprints are done`

**Status:** 🚧 ✅ Done — Authentication, Workspace, Canvas/Topic/Relationship CRUD, the visual editor, search, PNG/PDF export, offline support with sync, Performance, deployment, and final polish.

---

# 💡 Why TreeNote?

Traditional note-taking applications are optimized for writing.

TreeNote is optimized for **thinking**.

It enables users to visualize relationships between ideas, making information easier to understand, organize, and remember.

---

## ⚠️ Known Limitations (free-tier hosting)

- Backend cold-starts (~30–60s) after 15 minutes of inactivity.
- Database storage capped well below the architecture's documented 10,000-topic design target — sufficient for demo use, not production scale.
- No automated test suite yet (tracked for v1.1).

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Basel Alarashi**

Developed as a portfolio project while exploring modern full-stack web development using ASP.NET Core and Angular.

---

⭐ If you like this project, consider giving it a star.
