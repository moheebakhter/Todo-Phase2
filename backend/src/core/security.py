"""JWT and password security utilities."""

import hashlib
import os
import re
from datetime import datetime, timedelta

from jose import JWTError, jwt
from fastapi import HTTPException, status

from src.core.config import get_settings


# User ID validation constraints
USER_ID_MIN_LENGTH = 1
USER_ID_MAX_LENGTH = 255
USER_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_\-]+$")


class TokenPayload:
    """Decoded JWT payload containing user information."""

    def __init__(self, user_id: str, email: str | None = None):
        self.user_id = user_id
        self.email = email


# ---------------------------------------------------------------------------
# Password hashing (stdlib only — no bcrypt/passlib dependency)
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """Hash a password with a random salt using PBKDF2-SHA256."""
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return salt.hex() + ":" + key.hex()


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored PBKDF2 hash."""
    try:
        salt_hex, key_hex = stored_hash.split(":")
        salt = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
        return key.hex() == key_hex
    except (ValueError, TypeError):
        return False


# ---------------------------------------------------------------------------
# JWT creation
# ---------------------------------------------------------------------------

def create_token(user_id: str, email: str | None = None) -> str:
    """Create a signed JWT token for the given user."""
    settings = get_settings()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    payload: dict = {"sub": user_id, "exp": expire}
    if email:
        payload["email"] = email
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


# ---------------------------------------------------------------------------
# JWT verification
# ---------------------------------------------------------------------------

def _validate_user_id(user_id: str | None) -> str:
    """Validate user_id format from JWT payload."""
    if user_id is None:
        raise ValueError("Missing user_id")

    if not isinstance(user_id, str):
        raise ValueError("user_id must be a string")

    if len(user_id) < USER_ID_MIN_LENGTH:
        raise ValueError("user_id is empty")

    if len(user_id) > USER_ID_MAX_LENGTH:
        raise ValueError(f"user_id exceeds maximum length of {USER_ID_MAX_LENGTH}")

    if not USER_ID_PATTERN.match(user_id):
        raise ValueError("user_id contains invalid characters")

    return user_id


def verify_token(token: str) -> TokenPayload:
    """Verify and decode a JWT token."""
    settings = get_settings()

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = _validate_user_id(payload.get("sub"))
        email: str | None = payload.get("email")

        return TokenPayload(user_id=user_id, email=email)

    except ValueError:
        raise credentials_exception
    except JWTError:
        raise credentials_exception
