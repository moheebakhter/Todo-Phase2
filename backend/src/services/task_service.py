"""Task service layer for CRUD operations with user data isolation."""

from datetime import datetime
from uuid import UUID
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.models.task import Task, TaskCreate, TaskUpdate


async def create_task(
    db: AsyncSession,
    user_id: str,
    task_data: TaskCreate,
) -> Task:
    """Create a new task for the specified user.

    Args:
        db: Database session
        user_id: Owner's user ID from JWT
        task_data: Task creation data

    Returns:
        Created Task instance
    """
    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return task


async def get_tasks(
    db: AsyncSession,
    user_id: str,
) -> list[Task]:
    """Get all tasks for the specified user.

    Args:
        db: Database session
        user_id: Owner's user ID from JWT

    Returns:
        List of tasks belonging to the user
    """
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    result = await db.execute(statement)
    return list(result.scalars().all())


async def get_task(
    db: AsyncSession,
    user_id: str,
    task_id: UUID,
) -> Optional[Task]:
    """Get a single task by ID, filtered by user for isolation.

    Args:
        db: Database session
        user_id: Owner's user ID from JWT
        task_id: Task UUID

    Returns:
        Task if found and owned by user, None otherwise
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await db.execute(statement)
    return result.scalar_one_or_none()


async def update_task(
    db: AsyncSession,
    user_id: str,
    task_id: UUID,
    task_data: TaskUpdate,
) -> Optional[Task]:
    """Update an existing task with ownership check.

    Args:
        db: Database session
        user_id: Owner's user ID from JWT
        task_id: Task UUID to update
        task_data: Partial update data

    Returns:
        Updated Task if found and owned, None otherwise
    """
    task = await get_task(db, user_id, task_id)
    if task is None:
        return None

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    task.updated_at = datetime.utcnow()
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return task


async def delete_task(
    db: AsyncSession,
    user_id: str,
    task_id: UUID,
) -> bool:
    """Delete a task with ownership check.

    Args:
        db: Database session
        user_id: Owner's user ID from JWT
        task_id: Task UUID to delete

    Returns:
        True if deleted, False if not found or not owned
    """
    task = await get_task(db, user_id, task_id)
    if task is None:
        return False

    await db.delete(task)
    await db.flush()
    return True


async def toggle_task_completion(
    db: AsyncSession,
    user_id: str,
    task_id: UUID,
) -> Optional[Task]:
    """Toggle the completion status of a task.

    Args:
        db: Database session
        user_id: Owner's user ID from JWT
        task_id: Task UUID to toggle

    Returns:
        Updated Task if found and owned, None otherwise
    """
    task = await get_task(db, user_id, task_id)
    if task is None:
        return None

    task.is_completed = not task.is_completed
    task.updated_at = datetime.utcnow()
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return task
