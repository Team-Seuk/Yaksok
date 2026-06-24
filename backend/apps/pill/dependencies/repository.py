"""매칭 리포지토리 provider — P2 PillRepository(요청당 DB 세션) 생성 책임만."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from apps.pill.adapter.outbound.repositories.pill_repository import PillRepository
from apps.pill.app.ports.output.pill_repository import PillRepositoryPort
from core.db import get_db


def get_pill_repo(db: Annotated[Session, Depends(get_db)]) -> PillRepositoryPort:
    """P2 매칭 리포지토리(요청당 DB 세션)."""
    return PillRepository(db)
