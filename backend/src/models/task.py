"""Task model and schemas for the Todo application."""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field


class TaskBase(SQLModel):
    """Base model with shared fields for create/update operations."""

    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)


class Task(TaskBase, table=True):
    """Database model for tasks.

    Attributes:
        id: Unique task identifier (UUID)
        user_id: Owner's user ID from Better Auth JWT (NOT NULL, indexed)
        title: Task title (required, 1-255 chars)
        description: Optional task description
        is_completed: Completion status (default: False)
        created_at: Creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(nullable=False, index=True)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(TaskBase):
    """Request model for creating a task.

    Only title is required. Description is optional.
    user_id is extracted from JWT, not provided in request body.
    """

    pass


class TaskUpdate(SQLModel):
    """Request model for updating a task.

    All fields are optional - only provided fields are updated.
    """

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

    class Config:
        from_attributes = True
