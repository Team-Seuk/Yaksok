"""pill 도메인 조립 루트(DI). 라우터가 ``Depends(get_identify_use_case)`` 로 사용.

- **Vision**: `GOOGLE_API_KEY` 있으면 실제 `GeminiVisionAdapter`(P1 `core.gemini`),
  없으면 `FakeVisionAdapter` → 키 없어도 흐름 동작.
- **매칭**: P2 `PillRepository`(SQLAlchemy, `core.db` 세션) 실연동. DB가 필요하다.
  DB·키 없이 도는 테스트는 라우터에서 `dependency_overrides` 로 fake 를 주입한다.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from apps.pill.adapter.outbound.fake_vision_adapter import FakeVisionAdapter
from apps.pill.adapter.outbound.gemini_vision_adapter import GeminiVisionAdapter
from apps.pill.adapter.outbound.repositories.pill_repository import PillRepository
from apps.pill.app.ports.input.identify_port import IdentifyPillPort
from apps.pill.app.ports.output.pill_repository import PillRepositoryPort
from apps.pill.app.ports.output.vision_port import VisionPort
from apps.pill.app.use_cases.identify_pill import IdentifyPillUseCase
from core.config import get_settings
from core.db import get_db


def get_pill_repo(db: Annotated[Session, Depends(get_db)]) -> PillRepositoryPort:
    """P2 매칭 리포지토리(요청당 DB 세션)."""
    return PillRepository(db)


def get_identify_use_case(
    repo: Annotated[PillRepositoryPort, Depends(get_pill_repo)],
) -> IdentifyPillPort:
    """인식 유스케이스 제공자. (FastAPI Depends 대상)"""
    vision: VisionPort = (
        GeminiVisionAdapter() if get_settings().google_api_key else FakeVisionAdapter()
    )
    return IdentifyPillUseCase(vision=vision, repo=repo)
