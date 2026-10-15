from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App configuration, read from environment variables (or backend/.env).

    Each field name maps to an env variable with the same name, uppercased.
    Example: app_name <- APP_NAME. If the variable is missing, the default is used.
    """

    app_name: str = "NSUT Bazaar API"

    # Which website origins may call this API from a browser (CORS).
    # Comma-separated so it fits in a single env variable.
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
