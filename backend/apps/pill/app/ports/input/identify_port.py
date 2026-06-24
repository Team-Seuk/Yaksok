"""인식 입력(구동) 포트 — 라우터(inbound)가 호출하는 유스케이스 인터페이스.

구동 포트라 **ABC**로 둔다: 구현체(앱 자신의 use_case)가 명시적으로 상속하고,
``execute`` 미구현 시 인스턴스 생성 단계에서 바로 에러난다(명시·강제).
(반대로 피구동/출력 포트 VisionPort·PillRepositoryPort 는 느슨한 결합을 위해 Protocol.)
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from apps.pill.app.dtos.identify import IdentifyResult


class IdentifyPillPort(ABC):
    @abstractmethod
    def execute(self, image_bytes: bytes, mime_type: str) -> IdentifyResult:
        """알약 사진 → 추출 속성 + 후보 약 결과."""
        ...
