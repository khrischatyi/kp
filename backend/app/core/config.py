"""Application configuration sourced from the shared .env file."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Pydantic-driven settings; reads from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: str = Field(default="development")
    app_name: str = Field(default="Atelier Kitchens")
    app_domain: str = Field(default="localhost")

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_log_level: str = "info"
    secret_key: str = "change-me"
    cors_origins: str = "http://localhost,http://localhost:5173,http://localhost:8080"

    database_url: str = "postgresql+psycopg://kitchen:kitchen_dev_password@db:5432/kitchen_portfolio"

    photos_dir: Path = Path("/photos")

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
