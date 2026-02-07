# Auth-Service API Documentation

This document describes the API endpoints for the Auth-Service.

## Authentication
Most endpoints require a valid JWT token passed in the `access_token` cookie.


## Tenant Endpoints

### 1. Create Tenant
- **URL**: `/tenant`
- **Method**: `POST`
- **Auth required**: Admin
- **Body**:
  ```json
  {
    "name": "Tenant Name",
    "address": "Tenant Address"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  { "id": 1 }
  ```

### 2. Update Tenant
- **URL**: `/tenant/:id`
- **Method**: `PATCH`
- **Auth required**: Admin
- **Body**:
  ```json
  {
    "name": "New Name",
    "address": "New Address"
  }
  ```
- **Success Response**: `200 OK`

### 3. Get All Tenants
- **URL**: `/tenant`
- **Method**: `GET`
- **Query Params**:
  - `q`: Search query (optional)
  - `currentPage`: Page number (default: 1)
  - `perPage`: Items per page (default: 6)

### 4. Get One Tenant
- **URL**: `/tenant/:id`
- **Method**: `GET`
- **Auth required**: Admin

### 5. Delete Tenant
- **URL**: `/tenant/:id`
- **Method**: `DELETE`
- **Auth required**: Admin


## User Endpoints

### 1. Create User
- **URL**: `/users`
- **Method**: `POST`
- **Auth required**: Admin
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "manager",
    "tenantId": 1
  }
  ```
- **Success Response**: `201 Created`

### 2. Update User
- **URL**: `/users/:id`
- **Method**: `PATCH`
- **Auth required**: Admin
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "email": "john@example.com",
    "tenantId": 1
  }
  ```

### 3. Get All Users
- **URL**: `/users`
- **Method**: `GET`
- **Auth required**: Admin
- **Query Params**:
  - `q`: Search query (optional)
  - `role`: Filter by role (optional)
  - `currentPage`: Page number (default: 1)
  - `perPage`: Items per page (default: 6)

### 4. Get One User
- **URL**: `/users/:id`
- **Method**: `GET`
- **Auth required**: Admin

### 5. Delete User
- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Auth required**: Admin


## Auth Endpoints

### 1. Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "firstName": "Rakesh",
    "lastName": "K",
    "email": "rakesh@example.com",
    "password": "password"
  }
  ```

### 2. Login
- **URL**: `/auth/login`
- **Method**: `POST`

### 3. Get Self
- **URL**: `/auth/self`
- **Method**: `GET`
- **Auth required**: Any authenticated user
