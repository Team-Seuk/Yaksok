"""환경변수 / .env 로더.

실제 키 값은 ``backend/.env`` 에만 둔다(절대 커밋 금지).
필요한 키 목록은 ``backend/.env.example`` 참고.
키는 기본 ``None`` — 아직 기능 미구현이라 키 없이도 서버가 뜬다.
실제 호출부에서 누락 시 명확히 에러낼 것.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",  # backend/ 에서 uvicorn 실행 기준
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # 외부 API 키 (backend/.env)
    anthropic_api_key: str | None = None
    data_go_kr_key: str | None = None


@lru_cache
def get_settings() -> Settings:
    """앱 전역에서 재사용하는 설정 싱글턴. 사용 예: ``from core.config import get_settings``."""
    return Settings()
