# REST API

Base URL

```
/api/v1/
```

---

## Authentication

POST

```
/auth/register
```

POST

```
/auth/login
```

POST

```
/auth/google
```

POST

```
/auth/refresh
```

POST

```
/auth/logout
```

---

## Workspace

GET

```
/workspaces
```

GET

```
/workspaces/{id}
```

POST

```
/workspaces
```

PUT

```
/workspaces/{id}
```

DELETE

```
/workspaces/{id}
```

---

## Topics

GET

```
/topics/{id}
```

POST

```
/topics
```

PUT

```
/topics/{id}
```

DELETE

```
/topics/{id}
```

---

## Relationships

POST

```
/relationships
```

DELETE

```
/relationships
```

---

## Search

GET

```
/search?query=
```

---

## Export

GET

```
/export/png
```

GET

```
/export/pdf
```

---

## HTTP Status

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

500 Internal Server Error