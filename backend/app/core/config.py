from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/travel_view"
    REDIS_URL: str = "redis://localhost:6379/0"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Automated crawl & sync configuration
    AUTO_CRAWL_ENABLED: bool = True
    AUTO_CRAWL_INTERVAL_HOURS: int = 6
    VNAT_API_TIMEOUT: int = 15

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Allow passing env vars or loading from .env
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
