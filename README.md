# Auth Service

Node.js authentication service with JWT access/refresh tokens, cookie-based sessions, and multi-tenant user management.

## Features

- **JWT auth**: RS256 access tokens (JWKS), HS256 refresh tokens with rotation
- **Cookies**: HttpOnly, SameSite=Strict for `access_token` and `refresh_token`
- **Roles**: `admin`, `manager`, `customer` with role-based access
- **Tenants**: Tenant CRUD and user–tenant association
- **Stack**: Express, TypeORM, PostgreSQL, express-validator

## Quick start

```bash
# Install
npm install

# Set up environment (copy and edit)
cp .env.example .env

# Generate certs and keys (see scripts/)
node scripts/generateKeys.js

# Run migrations
npm run migration:run

# Dev server
npm run dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon (tsx) |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run Vitest |
| `npm run test:coverage` | Coverage report |
| `npm run migration:generate` | Generate migration from entity changes |
| `npm run migration:run` | Apply migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run lint:check` / `lint:fix` | ESLint |
| `npm run format:check` / `format:fix` | Prettier |

## Environment

See [.env.example](.env.example). Required:

- `PORT`, `NODE_ENV`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `JWKS_URI` (e.g. `http://localhost:5501/.well-known/jwks.json`)
- `REFRESH_TOKEN_SECRET` (min 32 chars for HS256)

## Documentation

- [API reference](docs/api-docs.md) — endpoints, request/response shapes
- [Architecture](docs/architecture.md) — security, data flow, storage

## License

ISC
