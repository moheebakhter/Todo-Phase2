# Research: Todo Full-Stack Web Application

**Feature**: 001-todo-fullstack-app
**Date**: 2026-01-30
**Status**: Complete

## Overview

This document captures technology decisions, best practices research, and rationale for the Todo Full-Stack Web Application implementation.

---

## Decision 1: Authentication Strategy

### Decision
Use Better Auth with JWT plugin for frontend authentication, with JWT tokens verified by FastAPI backend using a shared secret.

### Rationale
- **Better Auth** is purpose-built for Next.js App Router and handles:
  - Session management
  - JWT token issuance
  - Secure cookie storage (httpOnly)
  - Built-in signup/signin flows
- **Shared secret JWT** is simpler than asymmetric keys for a hackathon MVP
- **Stateless verification** allows backend to validate tokens without calling auth service

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| NextAuth.js | Being deprecated in favor of Auth.js; Better Auth is more modern |
| Auth0/Clerk | External dependency; overkill for hackathon; cost concerns |
| Custom JWT | More code to write; Better Auth handles edge cases |
| Session cookies only | Would require backend to call frontend for auth; coupling violation |

### Implementation Notes
- Both services must share the same secret via environment variables
- Better Auth issues JWT with `sub` (user ID) claim
- Backend extracts `sub` from verified token for user identification

---

## Decision 2: Backend Framework

### Decision
Use FastAPI with SQLModel for the Python backend.

### Rationale
- **FastAPI** provides:
  - Automatic OpenAPI documentation
  - Pydantic validation built-in
  - Async support for database operations
  - Dependency injection for auth middleware
- **SQLModel** provides:
  - SQLAlchemy + Pydantic in one library
  - Type-safe database models
  - Direct compatibility with FastAPI

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Flask | No built-in async; manual OpenAPI setup |
| Django | Too heavyweight for simple CRUD API |
| Express.js | Constitution specifies Python backend |
| Raw SQLAlchemy | SQLModel provides better FastAPI integration |

### Best Practices Applied
- Use dependency injection for `get_current_user`
- Separate routes, services, and models into distinct modules
- Use Pydantic models for request/response validation
- Configure CORS explicitly for frontend origin

---

## Decision 3: Database Connection

### Decision
Use Neon Serverless PostgreSQL with asyncpg driver via SQLModel.

### Rationale
- **Neon** is specified in constitution technology stack
- **Serverless** scales automatically; no connection pool management
- **asyncpg** is the fastest PostgreSQL driver for Python async
- **SQLModel** abstracts connection handling

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Supabase | Not specified in constitution; different auth model |
| PlanetScale | MySQL-based; PostgreSQL required |
| Local PostgreSQL | Not serverless; deployment complexity |
| psycopg2 | Synchronous; asyncpg is faster for async FastAPI |

### Implementation Notes
- Connection string via `DATABASE_URL` environment variable
- Use Alembic for migrations
- Enable connection pooling via Neon console

---

## Decision 4: Frontend State Management

### Decision
Use React Server Components with minimal client state; Better Auth for auth state.

### Rationale
- **Server Components** (Next.js 16+ default) reduce client bundle
- **Better Auth hooks** manage authentication state
- **No Redux/Zustand needed** for simple CRUD operations
- **React Query alternative**: Considered but adds complexity for MVP

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Redux | Overkill for simple todo app |
| Zustand | Additional dependency for minimal benefit |
| React Query | Good for caching but adds complexity |
| SWR | Similar to React Query; deferred for simplicity |

### Best Practices Applied
- Prefer Server Components for data fetching
- Use Client Components only for interactivity (forms, toggles)
- Leverage Next.js `loading.tsx` and `error.tsx` for states
- Use `useOptimistic` for toggle completion (UX improvement)

---

## Decision 5: API Client Architecture

### Decision
Create a typed fetch wrapper that automatically attaches JWT from Better Auth session.

### Rationale
- **Centralized auth handling**: All API calls go through one client
- **Type safety**: TypeScript interfaces for all requests/responses
- **Error handling**: Consistent 401 redirect to login
- **No external library needed**: Native fetch is sufficient

### Implementation Pattern

```typescript
// lib/api-client.ts
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession(); // Better Auth

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.accessToken}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    redirect('/login');
  }

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}
```

---

## Decision 6: User Isolation Strategy

### Decision
Enforce user isolation at three layers: API middleware, service layer, and database schema.

### Rationale
- **Defense in depth**: Multiple barriers prevent cross-user access
- **Constitution requirement**: Principle III mandates user data isolation
- **Fail-safe design**: Even if one layer fails, others protect data

### Implementation Layers

| Layer | Mechanism | Failure Mode |
|-------|-----------|--------------|
| API Middleware | `get_current_user` dependency injection | 401 if no valid JWT |
| Service Layer | All methods require `user_id` parameter | Python type error if missing |
| Database | `user_id` FK, index, WHERE clause | Query returns empty (not other user's data) |

### Query Pattern
```python
# CORRECT: Always filter by user_id
async def get_tasks(db: Session, user_id: str) -> list[Task]:
    return db.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()

# FORBIDDEN: Never query without user filter
async def get_tasks(db: Session) -> list[Task]:  # WRONG!
    return db.exec(select(Task)).all()
```

---

## Decision 7: Error Response Strategy

### Decision
Return 404 for tasks not found OR not owned by user (same response).

### Rationale
- **Security**: Does not reveal whether a task ID exists
- **Simplicity**: Single error path for "resource not accessible"
- **Privacy**: Attacker cannot enumerate task IDs

### HTTP Status Code Usage

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | Success | GET, PUT, PATCH successful |
| 201 | Created | POST successful |
| 204 | No Content | DELETE successful |
| 400 | Bad Request | Validation error (empty title, invalid JSON) |
| 401 | Unauthorized | Missing or invalid JWT |
| 404 | Not Found | Task doesn't exist OR not owned by user |
| 500 | Server Error | Unexpected exception |

---

## Decision 8: Migration Strategy

### Decision
Use Alembic for database migrations with SQLModel.

### Rationale
- **Version control**: Migrations tracked in git
- **Rollback support**: Can revert schema changes
- **Team-friendly**: Multiple developers can create migrations
- **SQLModel compatible**: Works with SQLModel models

### Implementation Notes
- Initialize with `alembic init alembic`
- Configure `env.py` to use SQLModel metadata
- Run `alembic revision --autogenerate` for new migrations
- Run `alembic upgrade head` to apply

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| How does Better Auth issue JWT? | Configure JWT plugin; tokens in `session.accessToken` |
| How to share secret between services? | Same env var value in both: `BETTER_AUTH_SECRET` = `JWT_SECRET` |
| Where to store user records? | Better Auth manages its own user table; backend only needs `user_id` |
| How to handle token refresh? | Better Auth handles automatically via httpOnly refresh cookie |

---

## References

- [Better Auth Documentation](https://better-auth.com)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Neon Serverless PostgreSQL](https://neon.tech/docs)
