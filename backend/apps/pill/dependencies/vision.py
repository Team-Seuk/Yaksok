"""Vision 포트 provider — 구현 선택(키 기반) 책임만."""

from __future__ import annotations

from apps.pill.adapter.outbound.fake_vision_adapter import FakeVisionAdapter
from apps.pill.adapter.outbound.gemini_vision_adapter import GeminiVisionAdapter
from apps.pill.app.ports.output.vision_port import VisionPort
from core.config import get_settings


def get_vision_port() -> VisionPort:
    """`GOOGLE_API_KEY` 있으면 실제 Gemini, 없으면 fake."""
    if get_settings().google_api_key:
        return GeminiVisionAdapter()
    return FakeVisionAdapter()
