"""유스케이스 provider — 주입받은 포트로 **조립만** 한다(구현 선택은 각 provider)."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from apps.pill.app.ports.input.identify_port import IdentifyPillPort
from apps.pill.app.ports.output.pill_repository import PillRepositoryPort
from apps.pill.app.ports.output.vision_port import VisionPort
from apps.pill.app.use_cases.identify_pill import IdentifyPillUseCase
from apps.pill.dependencies.repository import get_pill_repo
from apps.pill.dependencies.vision import get_vision_port


def get_identify_use_case(
    vision: Annotated[VisionPort, Depends(get_vision_port)],
    repo: Annotated[PillRepositoryPort, Depends(get_pill_repo)],
) -> IdentifyPillPort:
    """인식 유스케이스 제공자. (FastAPI Depends 대상)"""
    return IdentifyPillUseCase(vision=vision, repo=repo)
