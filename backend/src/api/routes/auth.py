"""Authentication routes — register and login with real DB persistence."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select

from src.api.deps import DbSession
from src.core.security import hash_password, verify_password, create_token
from src.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"]) 


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(data: SignupRequest, db: DbSession):
    """Create a new user account. Fails if email already exists."""
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name or data.email.split("@")[0],
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_token(str(user.id), user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
        },
    }


@router.post("/login")
async def login(data: LoginRequest, db: DbSession):
    """Authenticate an existing user. Fails if email not found or password wrong."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_token(str(user.id), user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
        },
    }
