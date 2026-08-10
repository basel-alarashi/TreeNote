# Sprint 4 — Authentication & User Management

## Sprint Goal

Implement secure authentication and authorization, allowing users to own and manage their workspaces while protecting all application resources.

---

# Deliverables

## Backend

- JWT Authentication
- Refresh Tokens
- Google OAuth
- Authorization Policies
- User Profile
- Secure API Endpoints
- Current User Service
- Password Reset (optional)
- Email Verification (optional for v1.0)

---

## Frontend

- Login page
- Register page
- Google Sign-In
- Authentication state management
- Route Guards
- HTTP Interceptor
- User Profile page
- Logout
- Session persistence

---

# NuGet Packages

Required

- Microsoft.AspNetCore.Authentication.JwtBearer
- Microsoft.AspNetCore.Authentication.Google

Recommended

- FluentValidation.AspNetCore

---

# NPM Packages

Required

- @abacritt/angularx-social-login

Optional

- jwt-decode

---

# Folder Structure

## Backend

```text
Application/

Authentication/
│
├── Commands/
│   ├── Register/
│   ├── Login/
│   ├── RefreshToken/
│   ├── Logout/
│   └── GoogleLogin/
│
├── DTOs/
├── Interfaces/
└── Services/

Users/
│
├── Queries/
├── DTOs/
└── Services/
```

```text
Infrastructure/

Authentication/
Identity/
Persistence/
```

```text
Api/

Controllers/
    AuthController.cs
    UsersController.cs
```

---

## Frontend

```text
features/

auth/
│
├── pages/
│   ├── login/
│   └── register/
│
├── services/
│
├── guards/
│
├── interceptors/
│
├── models/
│
└── components/
```

```text
core/

authentication/
```

---

# Sprint Tasks

## Stage A — Authentication

- [ ] Configure JWT Authentication.
- [ ] Configure JWT settings.
- [ ] Generate Access Tokens.
- [ ] Generate Refresh Tokens.
- [ ] Store Refresh Tokens securely.
- [ ] Implement Login.
- [ ] Implement Register.
- [ ] Implement Logout.
- [ ] Implement Refresh Token endpoint.
- [ ] Configure token expiration.

---

## Stage B — Google OAuth

- [ ] Configure Google OAuth.
- [ ] Verify Google ID Token.
- [ ] Create user automatically on first login.
- [ ] Link Google account.
- [ ] Handle duplicate email scenarios.

---

## Stage C — Authorization

- [ ] Secure all APIs with `[Authorize]`.
- [ ] Ensure users access only their own Workspaces.
- [ ] Ensure users access only their own Canvases.
- [ ] Ensure users access only their own Topics.
- [ ] Ensure users access only their own Relationships.
- [ ] Return correct HTTP status codes.

---

## Stage D — Current User

- [ ] Implement CurrentUserService.
- [ ] Read UserId from JWT.
- [ ] Remove UserId from client requests.
- [ ] Associate created resources with authenticated users.

---

## Stage E — Frontend Authentication

- [ ] Login page.
- [ ] Register page.
- [ ] Google Login button.
- [ ] Authentication service.
- [ ] HTTP Interceptor.
- [ ] Route Guard.
- [ ] Remember logged-in user.
- [ ] Logout.

---

## Stage F — User Profile

- [ ] Profile page.
- [ ] Display user information.
- [ ] Update display name.
- [ ] Change password.
- [ ] Update profile image (placeholder for future).

---

# API

## Authentication

POST

/api/v1/auth/register

POST

/api/v1/auth/login

POST

/api/v1/auth/google

POST

/api/v1/auth/refresh

POST

/api/v1/auth/logout

---

## User

GET

/api/v1/users/me

PUT

/api/v1/users/me

PUT

/api/v1/users/change-password

---

# Definition of Done

- Users can register.
- Users can log in.
- JWT authentication works.
- Refresh Tokens work correctly.
- Google OAuth works.
- Session persists after page refresh.
- Unauthorized users cannot access protected endpoints.
- Authenticated users can access only their own resources.
- User profile page functions correctly.
- Swagger supports JWT authorization.
- All code reviewed and merged into `develop`.

---

# Out of Scope

- Role-based authorization
- Multi-user collaboration
- Email verification
- Password reset emails
- Two-factor authentication
- Social login providers other than Google