# Auth Service Architecture

Technical breakdown of the Authentication Service: data flow, storage, and security.

## Key management & security

- **Access tokens (RS256)**
  - Signed with `certs/private.pem`.
  - Verified via JWKS (`JWKS_URI`) or public key from `certs/public.pem`.
- **Refresh tokens (HS256)**
  - Signed and verified with `REFRESH_TOKEN_SECRET`.
- **Passwords**
  - BCrypt with 10 salt rounds.

## Endpoints & data flow

### `POST /auth/register`

Creates a user and starts a session.

1. **Validation** — `registerValidator` (email, name, password).
2. **Persistence** — Check email uniqueness, hash password, insert into `User`.
3. **Tokens** — Access token (RS256), new row in `RefreshToken`, refresh token (HS256) with `jti` = refresh token row id.
4. **Response** — Set `access_token` and `refresh_token` cookies, return `201` with user id.

### `POST /auth/login`

Authenticates and starts a session.

1. **Validation** — `loginValidator`.
2. **Verification** — Load user by email, `bcrypt.compare` password.
3. **Tokens** — Same as register (new access + new refresh token row + cookies).
4. **Response** — Cookies set, `200` with user id.

### `GET /auth/self`

Current user profile. Requires valid access token (cookie or `Authorization: Bearer`).

1. **Auth** — `authenticate` middleware (JWKS/public key).
2. **Load** — User by `sub` from token, exclude password.
3. **Response** — `200` with user object.

### `POST /auth/refresh`

Rotates tokens when access token is expired.

1. **Validation** — `validateRefreshToken`: verify HS256 and that `jti` exists in `RefreshToken` for user `sub`.
2. **Rotation** — Delete current refresh token row, create new one, issue new access + refresh tokens.
3. **Response** — New cookies, `200`.

### `POST /auth/logout`

Ends the session.

1. **Auth** — Access token + refresh token (e.g. `parseRefreshToken`) to get `jti`.
2. **Invalidation** — Delete `RefreshToken` row by `jti`.
3. **Response** — Clear cookies, `200`.

## Storage

### TypeORM entities

**User**

| Field       | Type     | Description        |
|------------|----------|--------------------|
| id         | PK       | User ID            |
| firstName  | varchar  | First name         |
| lastName   | varchar  | Last name          |
| email      | varchar  | Unique, login      |
| password   | varchar  | BCrypt hash        |
| role       | enum     | admin/manager/customer |
| tenant     | ManyToOne| Optional tenant    |

**RefreshToken**

| Field    | Type      | Description        |
|----------|-----------|--------------------|
| id       | PK        | Used as `jti` in JWT |
| expiresAt| timestamp | Expiration         |
| user     | ManyToOne | Owner              |

**Tenant**

| Field  | Type    |
|--------|---------|
| id     | PK      |
| name   | varchar |
| address| varchar |

### Token payloads

**Access token**

- `sub` — user id  
- `role` — user role  
- `iss` — `auth-service`  
- `iat` / `exp` — issued / expiry  

**Refresh token**

- `sub`, `role`, `iss`, `iat`, `exp`  
- `jti` — id of the `RefreshToken` row (used for revocation and rotation)
