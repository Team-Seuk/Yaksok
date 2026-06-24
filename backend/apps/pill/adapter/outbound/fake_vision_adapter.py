"""가짜 Vision 어댑터 — P1 공용 Gemini 클라이언트가 없을 때 기본 주입용.

고정된 그럴듯한 속성을 돌려준다. P1 의 Gemini 클라이언트가 준비되면
DI 에서 ``GeminiVisionAdapter`` 로 교체한다. (e2e 흐름 검증·테스트용)
"""

from __future__ import annotations

from apps.pill.app.ports.output.vision_port import VisionPort
from apps.pill.domain.value_objects.pill_attributes import (
    Color,
    Form,
    PillAttributes,
    ScoreLine,
    Shape,
)

_DEFAULT = PillAttributes(
    shape=Shape.ROUND,
    color_front=Color.WHITE,
    imprint_front="T",
    line_front=ScoreLine.LINE,
    form=Form.TABLET,
)


class FakeVisionAdapter(VisionPort):
    """입력 이미지와 무관하게 고정 속성을 반환하는 스텁."""

    def __init__(self, attributes: PillAttributes = _DEFAULT) -> None:
        self._attributes = attributes

    def extract(self, image_bytes: bytes, mime_type: str) -> PillAttributes:
        return self._attributes
