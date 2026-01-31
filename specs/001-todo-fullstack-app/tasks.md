# Tasks: Todo Full-Stack Web Application

**Input**: Design documents from `/specs/001-todo-fullstack-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/app/`, `frontend/components/`, `frontend/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both frontend and backend

- [ ] T001 Create backend project structure with directories: backend/src/api/routes/, backend/src/core/, backend/src/models/, backend/src/services/
- [ ] T002 [P] Create frontend project structure using Next.js 16+ App Router in frontend/
- [ ] T003 [P] Initialize Python virtual environment and create backend/requirements.txt with FastAPI, SQLModel, python-jose, asyncpg, alembic, uvicorn
- [ ] T004 [P] Initialize frontend package.json with Next.js 16+, Better Auth, React 19+, TypeScript dependencies
- [ ] T005 [P] Create backend/.env.example with DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, CORS_ORIGINS placeholders
- [ ] T006 [P] Create frontend/.env.local.example with BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_API_URL placeholders
- [ ] T007 Create backend/src/__init__.py and all subpackage __init__.py files

**Checkpoint**: Project structure ready for foundational implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T008 Create backend/src/core/config.py with Settings class reading from environment variables (DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, CORS_ORIGINS)
- [ ] T009 Create backend/src/core/security.py with verify_token() function using python-jose to decode and validate JWT
- [ ] T010 Create backend/src/api/deps.py with get_current_user() dependency that extracts user_id from verified JWT
- [ ] T011 Create backend/src/models/task.py with Task SQLModel (id, user_id, title, description, is_completed, created_at, updated_at) and TaskCreate, TaskUpdate, TaskResponse schemas
- [ ] T012 Create backend/src/main.py with FastAPI app, CORS middleware configured for frontend origin, and router includes
- [ ] T013 Initialize Alembic with backend/alembic.ini and backend/alembic/env.py configured for SQLModel async
- [ ] T014 Create initial migration in backend/alembic/versions/ for tasks table with user_id index
- [ ] T015 Create backend/src/api/routes/health.py with GET /api/health endpoint returning {"status": "ok"}

### Frontend Foundation

- [ ] T016 [P] Create frontend/lib/auth-server.ts with Better Auth server configuration and JWT plugin
- [ ] T017 [P] Create frontend/lib/auth.ts with Better Auth client configuration
- [ ] T018 Create frontend/app/api/auth/[...all]/route.ts with Better Auth API route handlers
- [ ] T019 Create frontend/lib/api-client.ts with typed fetch wrapper that attaches JWT from session to Authorization header
- [ ] T020 Create frontend/types/index.ts with Task, TaskCreate, TaskUpdate TypeScript interfaces matching backend schemas
- [ ] T021 Create frontend/app/layout.tsx with root layout and metadata
- [ ] T022 Create frontend/components/auth-provider.tsx with Better Auth session provider wrapper
- [ ] T023 Create frontend/middleware.ts to protect /(dashboard)/* routes, redirecting unauthenticated users to /login
- [ ] T024 Create frontend/next.config.js with environment variable configuration

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration and Sign In (Priority: P1)

**Goal**: Enable users to create accounts, sign in, sign out, and access protected routes

**Independent Test**: Create account → Sign out → Sign back in → Verify redirect to dashboard

### Implementation for User Story 1

- [ ] T025 [P] [US1] Create frontend/app/(auth)/signup/page.tsx with signup form (email, password, submit)
- [ ] T026 [P] [US1] Create frontend/app/(auth)/login/page.tsx with login form (email, password, submit)
- [ ] T027 [US1] Create frontend/app/(auth)/layout.tsx with centered auth layout for login/signup pages
- [ ] T028 [US1] Add sign out functionality to frontend auth - create signOut action in frontend/lib/auth.ts
- [ ] T029 [US1] Create frontend/app/page.tsx as landing page that redirects authenticated users to dashboard, unauthenticated to login
- [ ] T030 [US1] Add error handling to signup/login forms displaying validation and auth errors
- [ ] T031 [US1] Create frontend/components/ui/button.tsx reusable button component
- [ ] T032 [US1] Create frontend/components/ui/input.tsx reusable input component with label and error state

**Checkpoint**: Users can sign up, sign in, sign out, and are redirected appropriately

---

## Phase 4: User Story 2 - Create and View Tasks (Priority: P2)

**Goal**: Enable authenticated users to create tasks and view their task list

**Independent Test**: Sign in → Create multiple tasks → Verify all appear in list → View empty state when no tasks

### Backend Implementation for User Story 2

- [ ] T033 [US2] Create backend/src/services/task_service.py with create_task(db, user_id, task_data) and get_tasks(db, user_id) functions
- [ ] T034 [US2] Create backend/src/api/routes/tasks.py with POST /api/tasks endpoint using get_current_user dependency
- [ ] T035 [US2] Add GET /api/tasks endpoint to backend/src/api/routes/tasks.py returning user's tasks only
- [ ] T036 [US2] Add GET /api/tasks/{task_id} endpoint to backend/src/api/routes/tasks.py with ownership check returning 404 if not found or not owned
- [ ] T037 [US2] Register tasks router in backend/src/main.py

### Frontend Implementation for User Story 2

- [ ] T038 [US2] Create frontend/app/(dashboard)/layout.tsx with protected layout including header with sign out button
- [ ] T039 [US2] Create frontend/app/(dashboard)/page.tsx as main task list page fetching tasks from API
- [ ] T040 [US2] Create frontend/components/task-form.tsx with form to create new task (title required, description optional)
- [ ] T041 [US2] Create frontend/components/task-list.tsx displaying list of tasks or empty state message
- [ ] T042 [US2] Create frontend/components/task-item.tsx displaying single task with title, description preview
- [ ] T043 [US2] Add frontend/app/(dashboard)/loading.tsx with loading skeleton for task list
- [ ] T044 [US2] Add frontend/app/(dashboard)/error.tsx with error boundary for task list page
- [ ] T045 [US2] Create frontend/app/(dashboard)/tasks/[id]/page.tsx for viewing single task details

**Checkpoint**: Users can create tasks and view their task list with proper empty/loading/error states

---

## Phase 5: User Story 3 - Update and Delete Tasks (Priority: P3)

**Goal**: Enable authenticated users to edit and delete their tasks

**Independent Test**: Create task → Edit title and description → Save → Verify changes → Delete task → Verify removed

### Backend Implementation for User Story 3

- [ ] T046 [US3] Add update_task(db, user_id, task_id, task_data) function to backend/src/services/task_service.py
- [ ] T047 [US3] Add delete_task(db, user_id, task_id) function to backend/src/services/task_service.py
- [ ] T048 [US3] Add PUT /api/tasks/{task_id} endpoint to backend/src/api/routes/tasks.py with ownership check
- [ ] T049 [US3] Add DELETE /api/tasks/{task_id} endpoint to backend/src/api/routes/tasks.py returning 204 on success

### Frontend Implementation for User Story 3

- [ ] T050 [US3] Update frontend/app/(dashboard)/tasks/[id]/page.tsx to include edit form for title and description
- [ ] T051 [US3] Add save functionality to task detail page calling PUT /api/tasks/{id}
- [ ] T052 [US3] Add delete button to task detail page with confirmation dialog
- [ ] T053 [US3] Add delete functionality calling DELETE /api/tasks/{id} and redirecting to dashboard
- [ ] T054 [US3] Handle 404 errors on task detail page when task not found or not owned

**Checkpoint**: Users can update and delete their tasks with ownership enforced

---

## Phase 6: User Story 4 - Toggle Task Completion (Priority: P4)

**Goal**: Enable users to mark tasks as complete/incomplete with visual distinction

**Independent Test**: Create task → Toggle complete → Verify visual change → Toggle incomplete → Verify reverted

### Backend Implementation for User Story 4

- [ ] T055 [US4] Add toggle_task_completion(db, user_id, task_id) function to backend/src/services/task_service.py
- [ ] T056 [US4] Add PATCH /api/tasks/{task_id}/toggle endpoint to backend/src/api/routes/tasks.py

### Frontend Implementation for User Story 4

- [ ] T057 [US4] Update frontend/components/task-item.tsx to include checkbox for completion status
- [ ] T058 [US4] Add toggle handler to task-item calling PATCH /api/tasks/{id}/toggle
- [ ] T059 [US4] Add visual styling to distinguish completed tasks (strikethrough, muted colors) in task-item.tsx
- [ ] T060 [US4] Add optimistic update for toggle to improve UX in task-item.tsx

**Checkpoint**: Users can toggle task completion with immediate visual feedback

---

## Phase 7: User Story 5 - Responsive Web Experience (Priority: P5)

**Goal**: Ensure application works well on mobile, tablet, and desktop devices

**Independent Test**: Access on mobile viewport → Verify usability → Access on desktop → Verify layout adapts

### Implementation for User Story 5

- [ ] T061 [P] [US5] Add responsive styles to frontend/app/(auth)/layout.tsx for mobile-friendly auth forms
- [ ] T062 [P] [US5] Add responsive styles to frontend/app/(dashboard)/layout.tsx with collapsible header on mobile
- [ ] T063 [US5] Update frontend/components/task-list.tsx with responsive grid/list layout
- [ ] T064 [US5] Update frontend/components/task-form.tsx with mobile-optimized form layout
- [ ] T065 [US5] Add frontend/app/globals.css with base responsive styles and CSS variables
- [ ] T066 [US5] Ensure all error messages and loading states are visible and readable on mobile

**Checkpoint**: Application is fully usable across all screen sizes (320px - 1920px)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and governance validation

- [ ] T067 [P] Add request logging to backend/src/main.py for debugging
- [ ] T068 [P] Add proper HTTP exception handlers to backend/src/main.py for consistent error responses
- [ ] T069 Validate all backend routes return correct HTTP status codes per API contract
- [ ] T070 Run DB Agent governance validation on backend/src/models/task.py
- [ ] T071 Run Backend Agent governance validation on backend/src/api/routes/tasks.py
- [ ] T072 Run Auth Agent governance validation on frontend/lib/auth.ts and backend/src/core/security.py
- [ ] T073 Run Frontend Agent governance validation on frontend/app/(dashboard)/ routes
- [ ] T074 Verify quickstart.md steps work end-to-end
- [ ] T075 Final cross-user isolation test: create two users, verify each only sees own tasks

**Checkpoint**: All governance agents approve, application ready for demo

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
     ↓
Phase 2 (Foundational) ──── BLOCKS ALL USER STORIES
     ↓
┌────┴────┬────────┬────────┬────────┐
↓         ↓        ↓        ↓        ↓
US1(P1)  US2(P2)  US3(P3)  US4(P4)  US5(P5)
↓         ↓        ↓        ↓        ↓
└────┬────┴────────┴────────┴────────┘
     ↓
Phase 8 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Auth) | Phase 2 | None (should be first) |
| US2 (Create/View) | Phase 2, US1 | US3, US4, US5 (after US1) |
| US3 (Update/Delete) | Phase 2, US2 backend | US4, US5 |
| US4 (Toggle) | Phase 2, US2 backend | US3, US5 |
| US5 (Responsive) | Phase 2, US1 frontend | US2, US3, US4 |

### Within Each User Story

1. Backend service functions first
2. Backend API routes second
3. Frontend components/pages last
4. Integration at the end

### Parallel Opportunities

**Phase 1 (4 parallel tracks)**:
```
T002, T003, T004, T005, T006 can run in parallel
```

**Phase 2 Backend (2 parallel tracks)**:
```
Track A: T008 → T009 → T010
Track B: T011 → T013 → T014
Then: T012, T015
```

**Phase 2 Frontend (2 parallel tracks)**:
```
Track A: T016, T017 → T018
Track B: T019, T020
Then: T021 → T022 → T023 → T024
```

**User Stories (after Phase 2)**:
```
US1 must complete first (auth required for others)
Then US2-US5 can overlap:
- US2 backend → US3/US4 backend (shares task_service.py)
- US2 frontend and US5 frontend can parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T024)
3. Complete Phase 3: US1 - Auth (T025-T032)
4. Complete Phase 4: US2 - Create/View (T033-T045)
5. **STOP and VALIDATE**: Demo sign up, sign in, create tasks, view tasks
6. This delivers a functional MVP

### Incremental Delivery

| Milestone | Stories Complete | Demo Capability |
|-----------|------------------|-----------------|
| MVP | US1 + US2 | Auth + Create/View tasks |
| +Update/Delete | US1-US3 | Full CRUD operations |
| +Toggle | US1-US4 | Progress tracking |
| +Responsive | US1-US5 | Mobile support |
| Polish | All + governance | Production ready |

---

## Task Summary

| Phase | Task Count | Parallel Opportunities |
|-------|------------|------------------------|
| Phase 1: Setup | 7 | 5 parallel |
| Phase 2: Foundation | 17 | 6 parallel |
| Phase 3: US1 Auth | 8 | 2 parallel |
| Phase 4: US2 Create/View | 13 | 0 (sequential) |
| Phase 5: US3 Update/Delete | 9 | 0 (sequential) |
| Phase 6: US4 Toggle | 6 | 0 (sequential) |
| Phase 7: US5 Responsive | 6 | 2 parallel |
| Phase 8: Polish | 9 | 2 parallel |
| **TOTAL** | **75** | **17 parallel** |

---

## Notes

- All [P] tasks can run in parallel within their phase
- [USn] labels map tasks to user stories for traceability
- Backend tasks generally precede frontend tasks within a story
- Commit after each task or logical group
- Run governance agents at Phase 8 checkpoints
- MVP is achievable with Phases 1-4 (35 tasks)
