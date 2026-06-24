"""pill 도메인 조립 루트(DI). 라우터가 ``Depends(get_identify_use_case)`` 로 사용.

- **Vision**: `GOOGLE_API_KEY` 가 있으면 실제 `GeminiVisionAdapter`(P1 `core.gemini`),
  없으면 `FakeVisionAdapter` → CI·오프라인에서도 e2e 동작.
- **매칭**: 아직 `FakeMatchingAdapter`(P2 스텁). P2 완성 시 이 한 곳만 교체.
"""

from __future__ import annotations

from apps.pill.adapter.outbound.fake_matching_adapter import FakeMatchingAdapter
from apps.pill.adapter.outbound.fake_vision_adapter import FakeVisionAdapter
from apps.pill.adapter.outbound.gemini_vision_adapter import GeminiVisionAdapter
from apps.pill.app.ports.input.identify_port import IdentifyPillPort
from apps.pill.app.ports.output.vision_port import VisionPort
from apps.pill.app.use_cases.identify_pill import IdentifyPillUseCase
from core.config import get_settings


def get_identify_use_case() -> IdentifyPillPort:
    """인식 유스케이스 제공자. (FastAPI Depends 대상)"""
    vision: VisionPort = (
        GeminiVisionAdapter() if get_settings().google_api_key else FakeVisionAdapter()
    )
    return IdentifyPillUseCase(vision=vision, matching=FakeMatchingAdapter())
