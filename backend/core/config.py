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
    google_api_key: str | None = None  # Gemini (LLM·Vision 공용) — https://aistudio.google.com
    data_go_kr_key: str | None = None

    # DB 접속 URL. 기본은 로컬 PostgreSQL(psycopg v3). 엔진은 지연 연결이라
    # DB가 없어도 서버는 뜨고, 실제 쿼리 시점에 연결한다.
    database_url: str = "postgresql+psycopg://yaksok:yaksok@localhost:5432/yaksok"


@lru_cache
def get_settings() -> Settings:
    """앱 전역에서 재사용하는 설정 싱글턴. 사용 예: ``from core.config import get_settings``."""
    return Settings()
