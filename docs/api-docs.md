# Auth Service API Reference

Base URL is the service origin (e.g. `http://localhost:5501`).  
Protected routes expect a valid JWT in the `access_token` cookie or `Authorization: Bearer <token>`.

---

## Auth

### Register

**`POST /auth/register`**

Creates a user (role `customer`) and sets auth cookies.

**Request body**

| Field      | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| firstName | string | yes      | First name         |
| lastName  | string | yes      | Last name         |
| email     | string | yes      | Valid email        |
| password  | string | yes      | Min 6 characters   |

**Success:** `201 Created`

```json
{ "message": "Registration successful", "id": 1 }
```

**Cookies:** `access_token`, `refresh_token` (HttpOnly, SameSite=Strict)

---

### Login

**`POST /auth/login`**

Authenticates and sets auth cookies.

**Request body**

| Field    | Type   | Required |
|----------|--------|----------|
| email    | string | yes      |
| password | string | yes      |

**Success:** `200 OK`

```json
{ "message": "Login successful", "id": 1 }
```

**Error:** `401` — Invalid email or password

---

### Get current user

**`GET /auth/self`**  
**Auth:** required (any role)

Returns the authenticated user (no password).

**Success:** `200 OK`

```json
{
  "id": 1,
  "firstName": "Rakesh",
  "lastName": "K",
  "email": "rakesh@example.com",
  "role": "customer"
}
```

**Error:** `401` — Missing or invalid token

---

### Refresh tokens

**`POST /auth/refresh`**

Uses the refresh token (cookie or Bearer) to issue new access and refresh tokens. Old refresh token is invalidated.

**Success:** `200 OK`

```json
{ "id": 1 }
```

**Cookies:** New `access_token` and `refresh_token`

**Error:** `401` — Invalid or revoked refresh token

---

### Logout

**`POST /auth/logout`**  
**Auth:** required (access token + refresh token for session invalidation)

Invalidates the current refresh token and clears auth cookies.

**Success:** `200 OK`

```json
{ "message": "Logout successful" }
```

---

## Tenants

All tenant mutations require **admin** role.

### Create tenant

**`POST /tenant`**  
**Auth:** admin

**Body**

| Field   | Type   | Required |
|---------|--------|----------|
| name    | string | yes      |
| address | string | yes      |

**Success:** `201 Created` — `{ "id": 1 }`

---

### Update tenant

**`PATCH /tenant/:id`**  
**Auth:** admin

**Body:** same as create (partial allowed)

**Success:** `200 OK` — `{ "id": 1 }`

**Error:** `400` — Invalid `id` param

---

### List tenants

**`GET /tenant`**  
**Auth:** none (public list)

**Query**

| Param       | Type   | Default | Description   |
|------------|--------|---------|---------------|
| q          | string | —       | Search term   |
| currentPage| number | 1       | Page number   |
| perPage    | number | 6       | Page size     |

**Success:** `200 OK`

```json
{
  "currentPage": 1,
  "perPage": 6,
  "total": 10,
  "data": [{ "id": 1, "name": "...", "address": "...", ... }]
}
```

---

### Get tenant

**`GET /tenant/:id`**  
**Auth:** admin

**Success:** `200 OK` — tenant object

**Error:** `400` — Invalid id or tenant not found

---

### Delete tenant

**`DELETE /tenant/:id`**  
**Auth:** admin

**Success:** `200 OK` — `{ "id": 1 }`

**Error:** `400` — Invalid id

---

## Users

All user endpoints require **admin** role.

### Create user

**`POST /users`**  
**Auth:** admin

**Body**

| Field     | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| firstName | string | yes      |                 |
| lastName  | string | yes      |                 |
| email     | string | yes      | Unique          |
| password  | string | yes      | Min 6 chars     |
| role      | string | yes      | admin/manager/customer |
| tenantId  | number | no       | Optional tenant |

**Success:** `201 Created` — `{ "id": 1 }`

**Error:** `400` — Validation or email already registered

---

### Update user

**`PATCH /users/:id`**  
**Auth:** admin

**Body:** `firstName`, `lastName`, `role`, `email`, `tenantId` (all optional)

**Success:** `200 OK` — `{ "id": 1 }`

**Error:** `400` — Invalid id or validation

---

### List users

**`GET /users`**  
**Auth:** admin

**Query**

| Param       | Type   | Default | Description   |
|------------|--------|---------|---------------|
| q          | string | —       | Search        |
| role       | string | —       | Filter by role|
| currentPage| number | 1       | Page          |
| perPage    | number | 6       | Page size     |

**Success:** `200 OK`

```json
{
  "currentPage": 1,
  "perPage": 6,
  "total": 10,
  "data": [{ "id": 1, "firstName": "...", ... }]
}
```

---

### Get user

**`GET /users/:id`**  
**Auth:** admin

**Success:** `200 OK` — user object (with tenant if set)

**Error:** `400` — Invalid id or user not found

---

### Delete user

**`DELETE /users/:id`**  
**Auth:** admin

**Success:** `200 OK` — `{ "id": 1 }`

**Error:** `400` — Invalid id

---

## Error responses

Validation and API errors return a consistent shape:

**`4xx / 5xx`**

```json
{
  "errors": [{
    "ref": null,
    "type": "BadRequest",
    "msg": "Validation failed",
    "path": "/auth/register",
    "details": [{ "msg": "Email is required", "param": "email" }]
  }]
}
```

Validation errors from `validateRequest` use `errors[].details` for field-level messages.
