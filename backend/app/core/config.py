"""
Application Settings & Environment Configuration.
Uses Pydantic BaseSettings to parse environment variables with sensible defaults.
"""

from typing import List, Optional
try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except Exception:
    try:
        from pydantic.v1 import BaseSettings  # type: ignore
        SettingsConfigDict = None  # type: ignore
    except Exception:
        from pydantic import BaseModel as BaseSettings  # type: ignore
        SettingsConfigDict = None  # type: ignore


class Settings(BaseSettings):
    """Application configuration settings."""

    PROJECT_NAME: str = "deadlock-predictor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Upstream Deadlock API settings
    DEADLOCK_API_BASE_URL: str = "https://api.deadlock-api.com"
    DEADLOCK_API_KEY: Optional[str] = None
    OFFLINE_MODE: bool = False

    # Networking & Resiliency
    REQUEST_TIMEOUT: float = 15.0
    MAX_RETRIES: int = 3
    RATE_LIMIT_DELAY: float = 0.05  # 20 requests per second maximum
    MAX_CACHE_SIZE: int = 1000
    CACHE_TTL_DEFAULT: int = 300

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    if SettingsConfigDict:
        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore",
        )
    else:
        class Config:
            env_file = ".env"
            extra = "ignore"


settings = Settings()
