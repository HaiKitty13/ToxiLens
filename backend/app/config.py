
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Application
    APP_NAME: str = Field(...)
    APP_VERSION: str = Field(...)
    APP_ENV: str = Field(...)
    DEBUG: bool = Field(...)

    # Server
    HOST: str = Field(...)
    PORT: int = Field(...)

    # Hugging Face
    HF_TOKEN: str = Field(...)

    #Indobertweet
    # Stage 1
    MODEL_METADATA_S1: str = Field(...)
    MODEL_TEXT_ONLY_S1: str = Field(...)
    MODEL_METADATA_FULL_S1: str = Field(...)

    # Stage 2
    MODEL_METADATA_S2: str = Field(...)
    MODEL_TEXT_ONLY_S2: str = Field(...)
    MODEL_METADATA_FULL_S2: str = Field(...)

    # Nusabert
    # Stage 1
    NUSABERT_METADATA_S1: str = Field(...)
    NUSABERT_TEXT_ONLY_S1: str = Field(...)
    NUSABERT_METADATA_FULL_S1: str = Field(...)

    # Stage 2
    NUSABERT_METADATA_S2: str = Field(...)
    NUSABERT_TEXT_ONLY_S2: str = Field(...)
    NUSABERT_METADATA_FULL_S2: str = Field(...)

    # Model configuration
    MAX_LENGTH: int = Field(...)
    STAGE2_THRESHOLD: float = Field(...)
    TOXIC_LABEL_INDEX: int = Field(...)
    MODEL_DEVICE: str = Field(...)

    # API
    FRONTEND_URL: str = Field(...)

    # Datasets
    REPO: str = Field(...)
    BASE_URL: str = Field(...)

    @property
    def MODEL_IDS(self) -> dict:
        return {
            "metadata_s1": self.MODEL_METADATA_S1,
            "text_only_s1": self.MODEL_TEXT_ONLY_S1,
            "metadata_full_s1": self.MODEL_METADATA_FULL_S1,
            "metadata_s2": self.MODEL_METADATA_S2,
            "text_only_s2": self.MODEL_TEXT_ONLY_S2,
            "metadata_full_s2": self.MODEL_METADATA_FULL_S2,
            "nusabert_metadata_s1": self.NUSABERT_METADATA_S1,
            "nusabert_text_only_s1": self.NUSABERT_TEXT_ONLY_S1,
            "nusabert_metadata_full_s1": self.NUSABERT_METADATA_FULL_S1,
            "nusabert_metadata_s2": self.NUSABERT_METADATA_S2,
            "nusabert_text_only_s2": self.NUSABERT_TEXT_ONLY_S2,
            "nusabert_metadata_full_s2": self.NUSABERT_METADATA_FULL_S2
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
