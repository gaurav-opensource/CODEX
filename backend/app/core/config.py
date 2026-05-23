from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "CORTEX"
    app_version: str = "0.1.0"
    environment: str = Field(default="development")
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    hydradb_api_key: str | None = None
    hydradb_project_id: str = "cortex-local"

    detection_latency_target_ms: int = 100
    recovery_time_target_ms: int = 1000
    recovery_success_target: float = 99.97


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
