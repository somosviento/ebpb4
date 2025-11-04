from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    api_prefix: str = Field(default="/api", alias="API_PREFIX")
    secret_key: str = Field(default="CHANGE_ME", alias="SECRET_KEY")
    sqlalchemy_database_url: str = Field(default="sqlite:///./ebpb.db", alias="DATABASE_URL")
    export_openapi: bool = Field(default=False, alias="EXPORT_OPENAPI")
    admin_token: str | None = Field(default=None, alias="ADMIN_TOKEN")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        populate_by_name = True


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
