import os
from pathlib import Path
# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    LLM_API_KEY: str = "your-api-key-here"
    LLM_MODEL: str = "gpt-5.6-luna"
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    FRONTEND_URL: str = "http://localhost:5173"
    CHROMA_PATH: str = "./data/chroma"
    DOCUMENTS_DIR: str = "./data/documents"
    MAX_UPLOAD_SIZE_MB: int = 50

    def is_llm_configured(self) -> bool:
        key = self.LLM_API_KEY.strip()
        if not key:
            return False
        if key in ["your-api-key-here", "your-api-key", "placeholder"]:
            return False
        return True

    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env", BASE_DIR.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
