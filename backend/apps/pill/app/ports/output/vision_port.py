"""Vision 출력 포트 — 사진에서 알약 속성을 추출하는 능력의 인터페이스.

use_case 는 이 ABC 에만 의존하고, 실제 구현(Gemini Vision / fake)은
adapter/outbound 에서 DI 로 주입한다. 외부 SDK 호출은 어댑터 안에만 둔다.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from apps.pill.domain.value_objects.pill_attributes import PillAttributes


class VisionPort(ABC):
    @abstractmethod
    def extract(self, image_bytes: bytes, mime_type: str) -> PillAttributes:
        """알약 사진(바이트) → 구조화된 식별 속성. 추출 실패 항목은 None."""
        ...
