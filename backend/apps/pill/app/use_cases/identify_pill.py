"""IdentifyPillUseCase — 인식 파이프라인의 조립부.

흐름: Vision 포트로 사진→속성 추출 → 속성을 P2 매칭 계약(`PillAttrs`)으로 변환 →
P2 `PillRepositoryPort.filter_candidates` 로 후보 약 조회 → 결과 반환.
Vision 포트와 매칭 포트(P2)를 생성자 주입받아 구체 구현을 모른다.
"""

from __future__ import annotations

from apps.pill.app.dtos.identify import IdentifyResult
from apps.pill.app.ports.input.identify_port import IdentifyPillPort
from apps.pill.app.ports.output.pill_repository import PillRepositoryPort
from apps.pill.app.ports.output.vision_port import VisionPort
from apps.pill.domain.entities.pill import PillAttrs
from apps.pill.domain.value_objects.pill_attributes import PillAttributes

# 한 번에 돌려줄 후보 수 상한.
_MATCH_LIMIT = 10


def _to_pill_attrs(attrs: PillAttributes) -> PillAttrs:
    """Vision 추출 속성(enum) → P2 매칭 입력(str). 식약처 raw 표기와 일치.

    - 각인(imprint) → print, 분할선(line) front/back 전달.
    - 추출 못 한 항목(None)은 그대로 None → 매칭에서 제외(감점 없음).
    """
    return PillAttrs(
        shape=attrs.shape.value if attrs.shape else None,
        color_front=attrs.color_front.value if attrs.color_front else None,
        color_back=attrs.color_back.value if attrs.color_back else None,
        print_front=attrs.imprint_front,
        print_back=attrs.imprint_back,
        line_front=attrs.line_front.value if attrs.line_front else None,
        line_back=attrs.line_back.value if attrs.line_back else None,
    )


class IdentifyPillUseCase(IdentifyPillPort):
    def __init__(self, vision: VisionPort, repo: PillRepositoryPort) -> None:
        self._vision = vision
        self._repo = repo

    def execute(self, image_bytes: bytes, mime_type: str) -> IdentifyResult:
        attributes = self._vision.extract(image_bytes, mime_type)
        candidates = self._repo.filter_candidates(_to_pill_attrs(attributes), limit=_MATCH_LIMIT)
        return IdentifyResult(attributes=attributes, candidates=candidates)
