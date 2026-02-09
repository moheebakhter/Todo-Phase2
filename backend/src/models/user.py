"""User model for authentication."""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    """Database model for users."""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str = Field()
    name: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
