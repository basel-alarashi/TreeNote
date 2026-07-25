# TreeNote 🌳

> A modern visual knowledge management application for organizing ideas using interactive concept maps.

![.NET](https://img.shields.io/badge/.NET-8-purple)
![Angular](https://img.shields.io/badge/Angular-21-red)
![SQL%20Server](https://img.shields.io/badge/SQL%20Server-2022-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-In%20Development-orange)

---

## 📖 Overview

TreeNote is a full-stack web application that enables users to organize information visually through hierarchical concept maps.

Instead of storing notes as plain text, TreeNote lets users build structured knowledge using connected topics, making brainstorming, planning, and learning more intuitive.

This project is being developed as a portfolio-quality application following Agile practices and modern software engineering principles.

---

## ✨ Features

### Version 1.0

- 🔐 JWT Authentication
- 🔑 Google OAuth
- 👤 User Profiles
- 📂 Workspace Management
- 🗺️ Canvas Management
- 🌳 Tree-based Concept Maps
- 🔗 Optional Multi-parent Relationships
- 🖱️ Drag & Drop Editing
- 🔍 Topic Search
- 📄 Export to PDF
- 🖼️ Export to PNG
- 📱 Responsive Design
- 📶 Offline Support

### Planned Features

- 👥 Collaboration
- 🤖 AI-assisted Mind Maps
- 📝 Markdown
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

             REST API (.NET 8)

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

- ASP.NET Core 8
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
- Swagger
- Visual Studio 2026

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
| Sprint 3 | Visual Canvas Editor | 🚧 In Progress |
| Sprint 4 | Authentication & User Management | ⬜ Planned |
| Sprint 5 | Search, Export & Offline Support | ⬜ Planned |
| Sprint 6 | Performance, Deployment & Final Polish | ⬜ Planned |

Note: authentication was deliberately deferred to Sprint 4 — Sprints 2–3 build the core domain and visual editor against a mocked current-user, then real auth is wired in without changing how the rest of the app consumes "who's logged in."

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

**Current Version:** `v0.2.0`

**Current Sprint:** `Sprint 3`

**Status:** 🚧 In Development — Authentication, Workspace, and Canvas/Topic/Relationship CRUD are functional against a mock user. Visual canvas editor (drag & drop, zoom, pan) is next.

---

# 💡 Why TreeNote?

Traditional note-taking applications are optimized for writing.

TreeNote is optimized for **thinking**.

It enables users to visualize relationships between ideas, making information easier to understand, organize, and remember.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Basel Alarashi**

Developed as a portfolio project while exploring modern full-stack web development using ASP.NET Core and Angular.

---

⭐ If you like this project, consider giving it a star.
