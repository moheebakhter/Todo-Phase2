"""JWT verification for authenticating requests from Better Auth."""

import re
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


def _validate_user_id(user_id: str | None) -> str:
    """Validate user_id format from JWT payload.

    Args:
        user_id: User ID extracted from JWT 'sub' claim

    Returns:
        Validated user_id string

    Raises:
        ValueError: If user_id is invalid
    """
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
    """Verify and decode a JWT token from Better Auth.

    The jose library automatically validates:
    - Token signature using JWT_SECRET
    - Token expiration (exp claim)
    - Token not-before time (nbf claim) if present

    Args:
        token: The JWT token string to verify

    Returns:
        TokenPayload with user_id and optional email

    Raises:
        HTTPException: 401 if token is invalid, expired, or malformed
    """
    settings = get_settings()

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # jose.jwt.decode automatically validates:
        # - Signature using the provided secret
        # - Expiration time (exp claim) - rejects expired tokens
        # - Not-before time (nbf claim) if present
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )

        # Extract and validate user ID from 'sub' claim
        user_id = _validate_user_id(payload.get("sub"))

        # Email is optional
        email: str | None = payload.get("email")

        return TokenPayload(user_id=user_id, email=email)

    except ValueError:
        # Invalid user_id format
        raise credentials_exception
    except JWTError:
        # Invalid token signature, expired, or malformed
        raise credentials_exception
