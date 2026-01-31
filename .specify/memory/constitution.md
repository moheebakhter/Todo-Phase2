<!--
SYNC IMPACT REPORT
==================
Version Change: 0.0.0 → 1.0.0 (MAJOR - initial ratification)
Modified Principles: N/A (new constitution)
Added Sections:
  - Core Principles (6 principles)
  - Security Standards
  - Development Workflow
  - Governance
Removed Sections: N/A
Templates Requiring Updates:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ Compatible (Requirements section supports security)
  - .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports governance)
Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Project Overview

**Objective:** Transform a single-user console-based Todo application into a modern, secure, multi-user full-stack web application with persistent storage using an Agentic Dev Stack workflow.

**Technology Stack:**

| Layer          | Technology                    |
|----------------|-------------------------------|
| Frontend       | Next.js 16+ (App Router)      |
| Backend        | Python FastAPI                |
| ORM            | SQLModel                      |
| Database       | Neon Serverless PostgreSQL    |
| Authentication | Better Auth (JWT tokens)      |
| Spec-Driven    | Claude Code + Spec-Kit Plus   |

## Core Principles

### I. Spec-Driven Development

All features MUST be defined in specifications before any implementation begins.

- **Mandatory Workflow:** spec → plan → tasks → implementation
- No implementation without an approved spec and plan
- If specs are missing or ambiguous → STOP and ask for clarification
- All code MUST be generated via Claude Code (no manual coding)
- Changes MUST be small, testable, and reference code precisely

**Rationale:** Specifications ensure alignment between requirements and implementation, reduce rework, and provide traceability for all development decisions.

### II. Security-First Architecture

Security is non-negotiable and MUST be enforced at every layer.

- All API endpoints MUST require valid JWT authentication
- Requests without valid JWT MUST return 401 Unauthorized
- JWT secret MUST be shared securely via environment variables only
- No secrets hardcoded in frontend or backend code
- Token expiry MUST be enforced on all protected endpoints
- User identity MUST be derived exclusively from verified JWT tokens (never client input)

**Rationale:** Multi-tenant applications require defense-in-depth security. Authentication failures MUST fail closed to prevent unauthorized access.

### III. User Data Isolation (NON-NEGOTIABLE)

No cross-user data access under any circumstance.

- ALL user-scoped tables MUST include a `user_id` foreign key column
- ALL queries on user data MUST filter by authenticated user_id from JWT
- Task ownership MUST be verified on every create, read, update, and delete operation
- Users MAY only access and modify their own tasks
- Cross-user joins are FORBIDDEN without explicit authorization model
- User deletion MUST cascade or soft-delete owned records (defined in specs)

**Rationale:** Data isolation is the foundation of multi-tenant security. A single violation can expose all user data and destroy trust.

### IV. Agent-Enforced Governance

Specialized governance agents validate all implementation work.

| Agent             | Domain                                                    |
|-------------------|-----------------------------------------------------------|
| **Auth Agent**    | Authentication flows, JWT handling, Better Auth config    |
| **Frontend Agent**| Next.js App Router, React components, client-side state   |
| **DB Agent**      | SQLModel schemas, migrations, data isolation, queries     |
| **Backend Agent** | FastAPI routes, middleware, dependency injection          |

- Governance agents MUST be invoked after changes to their respective domains
- Agents provide governance checks, not implementation
- Governance agents override skills in case of conflict
- All issues identified by agents MUST be resolved before proceeding

**Rationale:** Specialized agents catch domain-specific errors that general review would miss. Automated governance scales better than manual review.

### V. API & Data Integrity

RESTful API design with correct HTTP methods, status codes, and data contracts.

- Database schemas MUST enforce user ownership via `user_id` foreign keys
- All queries MUST filter by authenticated user_id extracted from JWT
- Soft deletes or cascades MUST be explicitly defined in specifications
- API responses MUST use appropriate HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (missing/invalid JWT)
  - 403: Forbidden (valid JWT but insufficient permissions)
  - 404: Not Found (resource does not exist or not owned by user)
  - 500: Internal Server Error
- All inputs MUST be validated with Pydantic models
- All endpoints MUST be documented with OpenAPI annotations

**Rationale:** Consistent API contracts reduce integration errors and improve developer experience. Proper status codes enable correct client-side error handling.

### VI. Clear Separation of Concerns

Frontend, backend, authentication, and database concerns MUST remain isolated.

- **Frontend (Next.js):** UI rendering, client state, API integration only
- **Backend (FastAPI):** Business logic, data access, request validation only
- **Authentication (Better Auth):** Session management, JWT issuance only
- **Database (PostgreSQL):** Data persistence, constraints, indexes only
- No business logic in the database layer (triggers, stored procedures)
- No direct database access from frontend
- Authentication state MUST flow through designated middleware

**Rationale:** Separation of concerns enables independent testing, deployment, and scaling of each layer. Violations create tightly coupled systems that are difficult to maintain.

## Security Standards

### JWT Authentication Flow

```
1. User logs in on Frontend → Better Auth creates session + issues JWT token
2. Frontend stores token securely (httpOnly cookies preferred)
3. Frontend makes API call → Includes JWT in Authorization: Bearer <token> header
4. Backend receives request → Extracts token, verifies signature using shared secret
5. Backend identifies user → Decodes token to get user ID, email, etc.
6. Backend filters data → Returns only tasks belonging to authenticated user
```

### Required Security Controls

- [ ] JWT tokens verified on every protected endpoint
- [ ] Shared secret stored in environment variables (never hardcoded)
- [ ] Token expiration enforced (recommended: 15 minutes access, 7 days refresh)
- [ ] Refresh token rotation implemented
- [ ] HTTPS required for all API communication
- [ ] CORS configured to allow only frontend origin
- [ ] Rate limiting on authentication endpoints

## Development Workflow

### Agentic Dev Stack Process

```
1. /sp.specify  →  Write feature specification
2. /sp.plan     →  Generate architecture plan (invoke relevant agents)
3. /sp.tasks    →  Break into testable tasks
4. /sp.implement →  Execute tasks via Claude Code (agents validate)
5. /sp.phr      →  Record prompt history
```

### Agent Invocation Points

| Phase          | Invoke Agent When...                                    |
|----------------|---------------------------------------------------------|
| Planning       | Designing data models (DB), auth flows (Auth), APIs (Backend), UI (Frontend) |
| Implementation | After changes to schemas, routes, middleware, components |
| Review         | Before marking any task complete                        |

### Cross-Agent Coordination Example

For "User creates a task" feature:

1. **DB Agent** reviews: Task model with `user_id` FK, indexes
2. **Backend Agent** reviews: POST `/api/tasks` endpoint, validation
3. **Auth Agent** reviews: JWT verification, user extraction
4. **Frontend Agent** reviews: Form component, API integration

## Governance

### Amendment Procedure

1. Proposed changes MUST be documented with rationale
2. Changes MUST be reviewed for impact on existing features
3. Version number MUST be incremented according to semantic versioning:
   - **MAJOR:** Backward-incompatible principle changes or removals
   - **MINOR:** New principles or materially expanded guidance
   - **PATCH:** Clarifications, wording fixes, non-semantic refinements
4. All dependent templates MUST be checked for consistency
5. Amendment date MUST be updated

### Compliance Requirements

- All PRs/reviews MUST verify compliance with these principles
- Constitution violations MUST be resolved before merge
- Complexity beyond these standards MUST be justified in plan.md
- Governance agents have final authority on their respective domains

### Conflict Resolution

1. Constitution principles take precedence over all other guidance
2. Governance agents override implementation skills
3. Security requirements override convenience or performance optimizations
4. When in doubt, STOP and ask for clarification

**Version**: 1.0.0 | **Ratified**: 2026-01-30 | **Last Amended**: 2026-01-30
