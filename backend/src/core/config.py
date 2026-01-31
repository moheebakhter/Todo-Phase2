"""Application configuration settings from environment variables."""

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import field_validator


# Allowed JWT algorithms (security: prevent algorithm confusion attacks)
ALLOWED_JWT_ALGORITHMS = {"HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "ES256", "ES384", "ES512"}

# Minimum JWT secret length for security
MIN_JWT_SECRET_LENGTH = 32


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str

    # JWT Configuration
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 15

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        """Validate JWT secret has minimum length for security."""
        if len(v) < MIN_JWT_SECRET_LENGTH:
            raise ValueError(
                f"JWT_SECRET must be at least {MIN_JWT_SECRET_LENGTH} characters. "
                "Generate a secure secret with: openssl rand -base64 64"
            )
        return v

    @field_validator("JWT_ALGORITHM")
    @classmethod
    def validate_jwt_algorithm(cls, v: str) -> str:
        """Validate JWT algorithm is in allowlist (prevent algorithm confusion)."""
        if v not in ALLOWED_JWT_ALGORITHMS:
            raise ValueError(
                f"JWT_ALGORITHM must be one of: {', '.join(sorted(ALLOWED_JWT_ALGORITHMS))}. "
                f"Got: {v}"
            )
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
