# Auth Service Architecture Documentation

This document provides a detailed technical breakdown of the Authentication Service, including data flow, storage locations, and security mechanisms.

## 🔑 Key Management & Security

The service uses a hybrid token strategy:

- **Asymmetric Encryption (RS256)**: Used for **Access Tokens**.
    - **Signing**: Done using a private key (`certs/private.pem`).
    - **Verification**: Done using a public key (extracted from `certs/public.pem`) or via a JWKS endpoint.
- **Symmetric Encryption (HS256)**: Used for **Refresh Tokens**.
    - **Secret**: Managed via `REFRESH_TOKEN_SECRET` in environment variables.
- **Password Hashing**: Done using **BCrypt** with 10 salt rounds.


## 🛰️ Endpoints & Data Flow

### 1. `POST /auth/register`
Creates a new user account and initiates a session.

**Data Flow:**
1. **Validation**: Requests are validated against `registerValidator` (validates email, name, password strength).
2. **Persistence**: 
    - Checks if email exists in `User` table.
    - Hashes password using BCrypt.
    - Saves new user to the `User` table.
3. **Token Generation**:
    - Generates an **Access Token** (RS256) with payload: `{ sub: userId, role: userRole }`.
    - Persists a new record in `RefreshToken` table (linked to the user).
    - Generates a **Refresh Token** (HS256) containing the `id` of the database record as `jti`.
4. **Response**: 
    - Sets `access_token` and `refresh_token` as **HttpOnly, SameSite=Strict** cookies.
    - Returns `201 Created` with the user ID.

### 2. `POST /auth/login`
Authenticates existing users and initiates a session.

**Data Flow:**
1. **Validation**: Validates input format via `loginValidator`.
2. **Verification**: 
    - Fetches user by email from `User` table.
    - Compares provided password with the stored hash using `bcrypt.compare`.
3. **Token Generation**: (Same as Register)
    - Generates Access Token.
    - Persists new Refresh Token record in DB.
    - Generates Refresh Token (JWT).
4. **Response**: 
    - Sets cookies (`access_token`, `refresh_token`).
    - Returns `200 OK`.

### 3. `GET /auth/self`
Retrieves the logged-in user's profile.

**Data Flow:**
1. **Authentication**: `authenticate` middleware verifies the `access_token` from cookies/headers using the public key.
2. **Identification**: Extracts `sub` (userId) from the token payload.
3. **Fetching**: Retrieves user details from the `User` table.
4. **Response**: Returns user object (excluding the `password` field).

### 4. `POST /auth/refresh`
Rotates tokens when the access token expires.

**Data Flow:**
1. **Validation**: `validateRefreshToken` middleware verifies the JWT signature and checks if the `jti` (tokenId) exists in the `RefreshToken` table and belongs to the user (`sub`).
2. **Rotation**:
    - Deletes the old `RefreshToken` record from the DB.
    - Creates a **new** `RefreshToken` record in the DB.
    - Generates a **new Access Token**.
    - Generates a **new Refresh Token** (JWT).
3. **Response**: 
    - Updates cookies with the new tokens.
    - Returns `200 OK`.

### 5. `POST /auth/logout`
Terminates the user session.

**Data Flow:**
1. **Identification**: Uses `authenticate` and `parseRefreshToken` to identify the user and the active session.
2. **Invalidation**: Deletes the `RefreshToken` record from the database.
3. **Cleanup**: Clears `access_token` and `refresh_token` cookies.
4. **Response**: Returns `200 OK`.


## 🗄️ Storage Mapping

### Database Entities (`TypeORM`)

#### `User` Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `PrimaryGeneratedColumn` | Unique User ID |
| `firstName` | `varchar` | User's first name |
| `lastName` | `varchar` | User's last name |
| `email` | `varchar (Unique)` | Unique login email |
| `password` | `varchar (Hashed)` | BCrypt hash of the password |
| `role` | `enum (ROLES)` | User role (e.g., CUSTOMER, ADMIN) |

#### `RefreshToken` Entity
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `PrimaryGeneratedColumn` | Unique Token ID (used as `jti` in JWT) |
| `expiresAt` | `timestamp` | Absolute expiration date |
| `user` | `ManyToOne (User)` | Relation to the owner |

### Token Payloads

**Access Token (JWT)**
```json
{
  "sub": "1",
  "role": "customer",
  "iss": "auth-service",
  "iat": 1707310000,
  "exp": 1707313600
}
```

**Refresh Token (JWT)**
```json
{
  "sub": "1",
  "role": "customer",
  "jti": "42",
  "iss": "auth-service",
  "iat": 1707310000,
  "exp": 1707396400
}
```
