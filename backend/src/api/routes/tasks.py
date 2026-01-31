"""Task API routes with JWT authentication and user isolation."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from src.api.deps import CurrentUser, DbSession
from src.models.task import TaskCreate, TaskUpdate, TaskResponse
from src.services import task_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> TaskResponse:
    """Create a new task for the authenticated user.

    Args:
        task_data: Task creation data (title required, description optional)
        current_user: Authenticated user from JWT
        db: Database session

    Returns:
        Created task with all fields
    """
    task = await task_service.create_task(db, current_user.user_id, task_data)
    return TaskResponse.model_validate(task)


@router.get("", response_model=list[TaskResponse])
async def get_tasks(
    current_user: CurrentUser,
    db: DbSession,
) -> list[TaskResponse]:
    """Get all tasks for the authenticated user.

    Args:
        current_user: Authenticated user from JWT
        db: Database session

    Returns:
        List of tasks owned by the user
    """
    tasks = await task_service.get_tasks(db, current_user.user_id)
    return [TaskResponse.model_validate(task) for task in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> TaskResponse:
    """Get a single task by ID.

    Args:
        task_id: Task UUID
        current_user: Authenticated user from JWT
        db: Database session

    Returns:
        Task if found and owned by user

    Raises:
        HTTPException: 404 if task not found or not owned by user
    """
    task = await task_service.get_task(db, current_user.user_id, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> TaskResponse:
    """Update an existing task.

    Args:
        task_id: Task UUID
        task_data: Partial update data
        current_user: Authenticated user from JWT
        db: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: 404 if task not found or not owned by user
    """
    task = await task_service.update_task(db, current_user.user_id, task_id, task_data)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    """Delete a task.

    Args:
        task_id: Task UUID
        current_user: Authenticated user from JWT
        db: Database session

    Raises:
        HTTPException: 404 if task not found or not owned by user
    """
    deleted = await task_service.delete_task(db, current_user.user_id, task_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task_completion(
    task_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> TaskResponse:
    """Toggle the completion status of a task.

    Args:
        task_id: Task UUID
        current_user: Authenticated user from JWT
        db: Database session

    Returns:
        Updated task with toggled is_completed

    Raises:
        HTTPException: 404 if task not found or not owned by user
    """
    task = await task_service.toggle_task_completion(db, current_user.user_id, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return TaskResponse.model_validate(task)
