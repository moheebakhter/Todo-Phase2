# Implementation Plan: Todo Full-Stack Web Application

**Branch**: `001-todo-fullstack-app` | **Date**: 2026-01-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-fullstack-app/spec.md`

## Summary

Build a secure, multi-user Todo web application that transforms the Phase I console app into a full-stack solution. The system uses Better Auth for authentication with JWT tokens, FastAPI for the backend API, Next.js App Router for the frontend, and Neon Serverless PostgreSQL for persistence. All data access is user-scoped with strict isolation enforced at both API and database layers.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**:
- Backend: FastAPI 0.109+, SQLModel 0.0.14+, python-jose (JWT), asyncpg
- Frontend: Next.js 16+, Better Auth, React 19+
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest (backend), Vitest/Jest (frontend)
**Target Platform**: Web (modern browsers), deployed to Vercel (frontend) + any Python host (backend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <3 second response for all user operations (per SC-007)
**Constraints**: Zero cross-user data access, all secrets via environment variables
**Scale/Scope**: 10+ concurrent authenticated users (per SC-008), responsive 320px-1920px

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | spec.md created with 21 functional requirements before planning |
| II. Security-First Architecture | PASS | JWT auth required on all endpoints; secrets via env vars |
| III. User Data Isolation | PASS | Task model includes user_id FK; all queries filter by user_id |
| IV. Agent-Enforced Governance | PASS | Plan includes agent validation checkpoints |
| V. API & Data Integrity | PASS | RESTful endpoints with proper HTTP status codes defined |
| VI. Clear Separation of Concerns | PASS | Frontend/Backend/Auth/Database layers isolated |

**Gate Result**: ALL PASS - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-fullstack-app/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: API contracts
│   └── api.yaml         # OpenAPI specification
└── tasks.md             # Phase 2: Implementation tasks (/sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependency injection (get_current_user)
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py        # Health check endpoint
│   │       └── tasks.py         # Task CRUD endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Settings from environment
│   │   └── security.py          # JWT verification
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py              # SQLModel Task definition
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py      # Business logic
│   └── main.py                  # FastAPI app entry point
├── alembic/                     # Database migrations
│   ├── versions/
│   └── env.py
├── tests/
│   ├── conftest.py
│   ├── test_tasks.py
│   └── test_auth.py
├── requirements.txt
├── alembic.ini
└── .env.example

frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx         # Sign in page
│   │   └── signup/
│   │       └── page.tsx         # Sign up page
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Protected layout with auth check
│   │   ├── page.tsx             # Task list (home)
│   │   └── tasks/
│   │       └── [id]/
│   │           └── page.tsx     # Task detail/edit
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts     # Better Auth API routes
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing/redirect
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── task-form.tsx
│   ├── task-list.tsx
│   ├── task-item.tsx
│   └── auth-provider.tsx
├── lib/
│   ├── auth.ts                  # Better Auth client config
│   ├── auth-server.ts           # Better Auth server config
│   ├── api-client.ts            # Backend API client with JWT
│   └── utils.ts
├── types/
│   └── index.ts                 # TypeScript types
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local.example
```

**Structure Decision**: Web application structure selected per constitution requirement for clear separation of concerns. Frontend and backend are fully isolated with JWT-based communication.

## Architecture Overview

### Authentication Flow

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    Frontend     │      │   Better Auth   │      │    Backend      │
│   (Next.js)     │      │   (Next.js)     │      │   (FastAPI)     │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │ 1. POST /api/auth/     │                        │
         │    sign-up or sign-in  │                        │
         │───────────────────────>│                        │
         │                        │                        │
         │ 2. Session created     │                        │
         │    JWT issued          │                        │
         │<───────────────────────│                        │
         │                        │                        │
         │ 3. Store JWT           │                        │
         │    (httpOnly cookie)   │                        │
         │                        │                        │
         │ 4. API Request         │                        │
         │    Authorization:      │                        │
         │    Bearer <token>      │                        │
         │─────────────────────────────────────────────────>│
         │                        │                        │
         │                        │ 5. Verify JWT          │
         │                        │    Extract user_id     │
         │                        │                        │
         │ 6. User-scoped data    │                        │
         │<─────────────────────────────────────────────────│
```

### Data Flow for Task Operations

```
Frontend                    Backend                     Database
────────                    ───────                     ────────
   │                           │                           │
   │ GET /api/tasks            │                           │
   │ Header: Bearer <jwt>      │                           │
   │──────────────────────────>│                           │
   │                           │ verify_jwt(token)         │
   │                           │ user_id = decode(jwt)     │
   │                           │                           │
   │                           │ SELECT * FROM tasks       │
   │                           │ WHERE user_id = {user_id} │
   │                           │──────────────────────────>│
   │                           │                           │
   │                           │<──────────────────────────│
   │                           │ [user's tasks only]       │
   │                           │                           │
   │<──────────────────────────│                           │
   │ 200 OK + tasks[]          │                           │
```

## API Endpoint Design

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | /api/health | Health check | No | - | 200: `{status: "ok"}` |
| GET | /api/tasks | List user's tasks | Yes | - | 200: `Task[]` |
| POST | /api/tasks | Create task | Yes | `{title, description?}` | 201: `Task` |
| GET | /api/tasks/{id} | Get single task | Yes | - | 200: `Task` / 404 |
| PUT | /api/tasks/{id} | Update task | Yes | `{title?, description?, is_completed?}` | 200: `Task` / 404 |
| DELETE | /api/tasks/{id} | Delete task | Yes | - | 204 / 404 |
| PATCH | /api/tasks/{id}/toggle | Toggle completion | Yes | - | 200: `Task` / 404 |

**Security Notes**:
- All `/api/tasks/*` endpoints require valid JWT in `Authorization: Bearer <token>` header
- 401 returned for missing/invalid JWT
- 404 returned for tasks not owned by authenticated user (does not reveal existence)

## Key Technical Decisions

### 1. Better Auth JWT Configuration

Better Auth will be configured to:
- Issue JWT tokens on successful authentication
- Store tokens in httpOnly cookies (XSS protection)
- Include `user_id` and `email` in JWT payload
- Use shared secret (via `BETTER_AUTH_SECRET` env var) for signing
- Set token expiration (access: 15 min, refresh: 7 days)

### 2. Backend JWT Verification

FastAPI backend will:
- Read JWT from `Authorization: Bearer` header
- Verify signature using shared secret (`JWT_SECRET` env var - same as `BETTER_AUTH_SECRET`)
- Decode and extract `user_id` from token payload
- Inject `current_user` via FastAPI dependency injection
- Reject requests with missing/invalid/expired tokens (401)

### 3. Database User Isolation

SQLModel Task schema will:
- Include `user_id` column as non-nullable foreign key
- Index on `user_id` for query performance
- All repository methods filter by `user_id` parameter
- No raw SQL; all queries through SQLModel ORM

### 4. Frontend Route Protection

Next.js App Router will:
- Use middleware to check authentication on `/(dashboard)/*` routes
- Redirect unauthenticated users to `/login`
- Store and refresh tokens automatically via Better Auth client
- Include JWT in all API requests via custom fetch wrapper

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# JWT (must match Better Auth secret)
JWT_SECRET=your-secure-secret-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=15

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### Frontend (.env.local)

```bash
# Better Auth
BETTER_AUTH_SECRET=your-secure-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Complexity Tracking

> No constitution violations requiring justification. Architecture follows all six principles.

| Aspect | Complexity Level | Justification |
|--------|------------------|---------------|
| Two separate projects (frontend/backend) | Standard | Required by constitution principle VI (separation of concerns) |
| JWT shared secret | Simple | Single secret shared via env vars; no asymmetric keys needed for MVP |
| No refresh token rotation | Simplified | Deferred for hackathon MVP; noted in spec as future enhancement |

## Agent Validation Checkpoints

### During Implementation

| Task Domain | Governance Agent | Validation Focus |
|-------------|------------------|------------------|
| SQLModel schemas | DB Agent | user_id FK, indexes, isolation |
| FastAPI routes | Backend Agent | Auth middleware, status codes, validation |
| JWT handling | Auth Agent | Token verification, secret management |
| Next.js pages/components | Frontend Agent | Protected routes, error handling |

### Pre-Completion Gate

Before marking feature complete, ALL agents must approve:
- [ ] Auth Agent: JWT flow secure, no hardcoded secrets
- [ ] DB Agent: User isolation enforced, proper indexes
- [ ] Backend Agent: All endpoints protected, correct status codes
- [ ] Frontend Agent: Routes protected, proper state handling
