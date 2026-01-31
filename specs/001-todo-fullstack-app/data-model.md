# Data Model: Todo Full-Stack Web Application

**Feature**: 001-todo-fullstack-app
**Date**: 2026-01-30
**Status**: Complete

## Overview

This document defines the data entities, their attributes, relationships, and validation rules for the Todo Full-Stack Web Application.

---

## Entity: User

**Managed by**: Better Auth (not defined in backend SQLModel)

Better Auth manages its own user table with the following relevant fields:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string (UUID) | PK | Unique user identifier |
| email | string | UNIQUE, NOT NULL | User's email address |
| emailVerified | boolean | DEFAULT false | Email verification status |
| name | string | NULLABLE | Display name |
| image | string | NULLABLE | Profile image URL |
| createdAt | timestamp | NOT NULL | Account creation time |
| updatedAt | timestamp | NOT NULL | Last update time |

**Note**: Backend does not create or manage users. It only receives `user_id` from verified JWT tokens issued by Better Auth.

---

## Entity: Task

**Managed by**: Backend (SQLModel)

### Schema Definition

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid4() | Unique task identifier |
| user_id | string | FK (logical), NOT NULL, INDEX | Owner's user ID from Better Auth |
| title | string(255) | NOT NULL, MIN 1 char | Task title |
| description | text | NULLABLE | Optional task description |
| is_completed | boolean | NOT NULL, DEFAULT false | Completion status |
| created_at | timestamp | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT now(), ON UPDATE now() | Last modification timestamp |

### SQLModel Implementation

```python
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field
from sqlalchemy import Index

class TaskBase(SQLModel):
    """Base model with shared fields for create/update operations."""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)

class Task(TaskBase, table=True):
    """Database model for tasks."""
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(nullable=False, index=True)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        Index("ix_tasks_user_id", "user_id"),
    )

class TaskCreate(TaskBase):
    """Request model for creating a task."""
    pass

class TaskUpdate(SQLModel):
    """Request model for updating a task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    is_completed: Optional[bool] = Field(default=None)

class TaskResponse(TaskBase):
    """Response model for a task."""
    id: UUID
    user_id: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime
```

### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| PRIMARY | id | Primary key lookup |
| ix_tasks_user_id | user_id | Fast filtering by user ownership |

### Constraints

| Constraint | Type | Description |
|------------|------|-------------|
| tasks_pkey | PRIMARY KEY | Unique task ID |
| title_not_empty | CHECK | title length >= 1 |
| user_id_not_null | NOT NULL | Every task must have an owner |

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────┐
│                   User                       │
│  (Managed by Better Auth - external)         │
├─────────────────────────────────────────────┤
│  id: UUID (PK)                              │
│  email: string (UNIQUE)                      │
│  name: string?                               │
│  createdAt: timestamp                        │
│  updatedAt: timestamp                        │
└──────────────────────┬──────────────────────┘
                       │
                       │ 1:N (one user, many tasks)
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                   Task                       │
│  (Managed by Backend - SQLModel)             │
├─────────────────────────────────────────────┤
│  id: UUID (PK)                              │
│  user_id: string (FK - logical) ◄───────────┤
│  title: string (NOT NULL)                    │
│  description: text?                          │
│  is_completed: boolean (DEFAULT false)       │
│  created_at: timestamp                       │
│  updated_at: timestamp                       │
└─────────────────────────────────────────────┘
```

**Note on Foreign Key**: The `user_id` in the Task table is a *logical* foreign key to Better Auth's user table. Since Better Auth uses a separate database/schema, we do not enforce a physical FK constraint. Instead:
- The backend validates `user_id` comes from a verified JWT
- Orphaned tasks (deleted users) are handled by application logic

---

## State Transitions

### Task Completion Status

```
┌──────────────┐         toggle         ┌──────────────┐
│              │ ─────────────────────► │              │
│ is_completed │                        │ is_completed │
│    = false   │ ◄───────────────────── │    = true    │
│              │         toggle         │              │
└──────────────┘                        └──────────────┘
     (New)                                (Complete)
```

- New tasks start with `is_completed = false`
- Toggle operation flips the current value
- Bidirectional transition allowed (can mark incomplete again)

---

## Validation Rules

### Task Creation (POST /api/tasks)

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Required, 1-255 chars | "Title is required and must be 1-255 characters" |
| description | Optional, no max | N/A |

### Task Update (PUT /api/tasks/{id})

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Optional, if provided: 1-255 chars | "Title must be 1-255 characters" |
| description | Optional | N/A |
| is_completed | Optional, boolean | "is_completed must be a boolean" |

### Authorization Rules

| Operation | Rule | Error Response |
|-----------|------|----------------|
| Create | User must be authenticated | 401 Unauthorized |
| Read (list) | Returns only tasks where `user_id` = authenticated user | 200 (empty array if none) |
| Read (single) | Task must exist AND `user_id` = authenticated user | 404 Not Found |
| Update | Task must exist AND `user_id` = authenticated user | 404 Not Found |
| Delete | Task must exist AND `user_id` = authenticated user | 404 Not Found |
| Toggle | Task must exist AND `user_id` = authenticated user | 404 Not Found |

---

## Database Migration (Initial)

### SQL (for reference)

```sql
-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    title VARCHAR(255) NOT NULL CHECK (length(title) >= 1),
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user queries
CREATE INDEX ix_tasks_user_id ON tasks (user_id);

-- Add trigger for updated_at (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Alembic Migration

Migration will be auto-generated from SQLModel using:
```bash
alembic revision --autogenerate -m "create tasks table"
alembic upgrade head
```

---

## Data Access Patterns

### Common Queries

| Operation | Query Pattern | Indexed? |
|-----------|---------------|----------|
| List tasks | `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC` | Yes (ix_tasks_user_id) |
| Get task | `SELECT * FROM tasks WHERE id = ? AND user_id = ?` | Yes (PK + ix_tasks_user_id) |
| Create task | `INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)` | N/A |
| Update task | `UPDATE tasks SET ... WHERE id = ? AND user_id = ?` | Yes |
| Delete task | `DELETE FROM tasks WHERE id = ? AND user_id = ?` | Yes |
| Toggle | `UPDATE tasks SET is_completed = NOT is_completed WHERE id = ? AND user_id = ?` | Yes |

### Performance Considerations

- **User listing**: Always filtered by `user_id` with index support
- **Pagination**: Recommended for large task lists (not MVP requirement)
- **No N+1**: Single query returns all needed fields
