---
id: 001
title: Create Project Constitution
stage: constitution
date: 2026-01-30
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "governance", "security", "multi-tenant"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

Project: Todo Full-Stack Web Application (Hackathon Phase II)

Objective:
Transform a single-user console-based Todo application into a modern, secure,
multi-user full-stack web application with persistent storage using an
Agentic Dev Stack workflow.

Development Principles:
- Spec-driven development (spec → plan → tasks → implementation)
- Agent-enforced governance over all implementation
- No manual coding (all code generated via Claude Code)
- Security-first, multi-tenant architecture
- Clear separation of frontend, backend, authentication, and database concerns

Core Architectural Standards:
- Frontend: Next.js 16+ using App Router
- Backend: FastAPI (Python) with RESTful API design
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT-based verification
- Identity source: JWT claims only (never client input)

Non-Negotiable Rules:
- All features MUST be defined in specs before implementation
- No implementation without an approved spec and plan
- No cross-user data access under any circumstance
- User identity MUST be derived from verified JWT tokens
- All data access MUST be scoped to authenticated user
- Governance agents override skills in case of conflict
- If specs are missing or ambiguous → STOP and ask for clarification

Security Standards:
- All API endpoints require valid JWT authentication
- Requests without valid JWT return 401 Unauthorized
- Users may only access and modify their own tasks
- JWT secret MUST be shared securely via environment variables
- No secrets hardcoded in frontend or backend
- Token expiry must be enforced

API & Data Integrity Standards:
- RESTful API design with correct HTTP methods and status codes
- Database schemas MUST enforce user ownership (user_id foreign keys)
- All queries MUST filter by authenticated user_id
- Task ownership verified on every create, read, update, and delete
- Soft deletes or cascades must be explicitly defined in specs

Governance Model:
- Auth Agent governs authentication and identity rules
- Frontend Agent governs Next.js and React implementation
- DB Agent governs SQLModel schemas and data isolation
- Backend Agent governs FastAPI routes and middleware

## Response snapshot

Created constitution v1.0.0 with 6 core principles:
1. Spec-Driven Development - mandatory workflow enforcement
2. Security-First Architecture - JWT auth requirements
3. User Data Isolation (NON-NEGOTIABLE) - multi-tenant data protection
4. Agent-Enforced Governance - 4 specialized agents defined
5. API & Data Integrity - RESTful standards and HTTP status codes
6. Clear Separation of Concerns - layer isolation rules

Added sections: Security Standards (JWT flow, controls checklist), Development Workflow (Agentic Dev Stack process, agent invocation points), Governance (amendment procedure, compliance requirements, conflict resolution).

## Outcome

- Impact: Created foundational governance document for Phase II development
- Tests: N/A (constitution document)
- Files: .specify/memory/constitution.md created (v1.0.0)
- Next prompts: /sp.specify to create first feature specification
- Reflection: Constitution captures all user-provided principles with clear rationale and testable rules

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review PASS - all placeholders filled, no bracket tokens remaining
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
