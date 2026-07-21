# Database Design

## Tables

### Users

| Column | Type |
|---------|------|
| Id | uniqueidentifier |
| Email | nvarchar |
| PasswordHash | nvarchar |
| CreatedAt | datetime |

---

### Workspaces

| Column | Type |
|---------|------|
| Id | uniqueidentifier |
| UserId | FK |
| Name | nvarchar |
| CreatedAt | datetime |

---

### Topics

| Column | Type |
|---------|------|
| Id | uniqueidentifier |
| WorkspaceId | FK |
| Title | nvarchar(200) |
| X | float |
| Y | float |
| Emoji | nvarchar(10) |
| CreatedAt | datetime |

---

### Relationships

| Column | Type |
|---------|------|
| ParentId | FK |
| ChildId | FK |

Composite PK

ParentId + ChildId

---

### RefreshTokens

| Column | Type |
|---------|------|
| Id | uniqueidentifier |
| UserId | FK |
| Token | nvarchar |
| Expiration | datetime |

---

## Relationships

```
User

│

└── Workspace

│

└── Topic

│

└── Relationship
```

---

## Indexes

Users

- Email

Workspace

- UserId

Topic

- WorkspaceId

Relationship

- ParentId
- ChildId

---

## Notes

A topic does NOT contain ParentId.

Relationships are stored separately to support graphs.