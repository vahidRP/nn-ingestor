# NN Ingestor

A small, production-minded Node.js service that ingests marketing events. This repository is prepared as a technical assignment to demonstrate code structure, quality practices, and decision making.

## Goals of the assignment

- Provide a clean, typed API with validation and error handling
- Show security and reliability defaults (headers, CORS, TLS, logging)
- Demonstrate test coverage and CI-friendly workflows
- Keep the codebase easy to read, maintain, and extend

## What is included

- Express routing (`/health`, `/api/v1/auth`, `/api/v1/events`)
- Zod schemas for input validation and strong typing
- JWT bearer auth and centralized error handling
- Security hardening with Helmet and CORS
- HTTPS/HTTP2 local server via `spdy`
- Structured logging with correlation IDs
- Request metrics middleware (timing, status codes)
- Vitest coverage for controllers, services, and middlewares
- API docs via Bruno collection
- Developer experience with Husky + lint-staged
- CI checks for linting, tests, and security

## Architecture at a glance

- `src/controllers` map HTTP to service calls
- `src/services` contain business logic
- `src/middlewares` provide auth, logging, metrics, and error handling
- `src/routes` define endpoints and versioning
- `src/schemas` define Zod input/output contracts

This separation keeps handlers thin and makes testing and reuse straightforward.

## Quick start

Prerequisites: Node (see `.nvmrc`) and `pnpm`.

```bash
pnpm install
cp .env.example .env
# set JWT_SECRET in .env
pnpm dev
```

The server reads TLS certs from `certs/` and listens on `PORT` (default `9001`).

## API overview

- `POST /api/v1/auth/login` -> returns a JWT token
- `GET /api/v1/auth/me` -> returns the authenticated user
- `POST /api/v1/events` -> accepts one or many marketing events and responds `202`
- `GET /health` -> health check

Example event payload (single or array):

```json
{
  "eventType": "click",
  "timestamp": "2024-01-01T00:00:00Z",
  "context": { "campaign": "spring-sale" }
}
```

## Code quality and security decisions

- Input validation at boundaries via Zod schemas
- Consistent error shape and HTTP status mapping
- JWT auth for protected routes (extensible to refresh tokens)
- Security headers enabled by default with Helmet
- CORS configured explicitly to avoid permissive defaults
- Correlation IDs per request for traceability
- Linting, formatting, and pre-commit hooks to keep standards consistent

## Testing strategy

- Unit tests for services
- Integration-style tests for controllers and middleware
- Focus on error paths and validation to avoid regressions

Run tests with:

```bash
pnpm test
```

## Scripts

- `pnpm dev` run locally with `tsx`
- `pnpm build` compile TypeScript
- `pnpm start` run compiled output
- `pnpm test` run test suite
- `pnpm lint` and `pnpm format` for static checks

## Suggested next steps

- Persist events and users (Postgres + migrations)
- Password hashing (bcrypt/argon2) and refresh token flow
- Rate limiting and request throttling
- Observability: Prometheus metrics + tracing
- Queue-backed ingestion (Kafka/SQS) and retries
- Role-based access control for event endpoints
