# TreeNote - Sprint 1
---

## Goal

Build the technical foundation for the backend and frontend before
implementing authentication.

## Sprint Deliverables

Backend
- Configure Clean Architecture project references.
- Configure
Dependency Injection.
- Configure Entity Framework Core.
- Configure SQL
Server connection.
- Configure ASP.NET Core Identity.
- Create the
initial DbContext.
- Create the first EF Core migration.
- Add a Health
Check endpoint.
- Configure application settings.
- Configure structured
logging.

Frontend
- Install Angular Material.
- Install Angular CDK.
- Configure
the application theme.
- Configure routing and shell layout.

## NuGet Packages

-   Microsoft.EntityFrameworkCore.SqlServer
-   Microsoft.EntityFrameworkCore.Design
-   Microsoft.EntityFrameworkCore.Tools
-   Microsoft.AspNetCore.Identity.EntityFrameworkCore

## NPM Packages

-   @angular/material
-   @angular/cdk

## Recommended Folder Structure

```
Application/ DTOs/ Interfaces/ Services/ Validators/
```

```
Domain/ Entities/ Enums/ Constants/
```

```
Infrastructure/ Persistence/ Identity/ Configurations/ Extensions/
```

```
Api/ Controllers/ Extensions/ Middlewares/ Configurations/
```

## Sprint Tasks

- [ ] Create Clean Architecture project references.
- [ ] Configure Dependency Injection.
- [ ] Add EF Core packages.
- [ ] Configure SQL Server connection string.
- [ ] Create ApplicationDbContext.
- [ ] Configure ASP.NET Core Identity.
- [ ] Add the initial migration.
- [ ] Update the database.
- [ ] Verify Swagger still works.
- [ ] Add Health Check endpoint (/health).
- [ ] Install Angular Material.
- [ ] Install Angular CDK.
- [ ] Configure the global theme.
- [ ] Configure application shell and routing.
- [ ] Commit changes to Git.

## Definition of Done

-   Solution builds without errors.
-   Angular application runs successfully.
-   Swagger loads successfully.
-   Database is created from the first migration.
-   Health endpoint returns HTTP 200.
-   All changes committed to Git.
