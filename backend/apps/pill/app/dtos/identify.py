"""인식 use_case의 결과 DTO.

후보 약은 P2 매칭이 돌려주는 도메인 엔티티 ``PillCandidate`` 를 그대로 담는다.
API 스키마(pydantic)는 adapter/inbound/api/schemas 에서 변환한다.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from apps.pill.domain.entities.pill import PillCandidate
from apps.pill.domain.value_objects.pill_attributes import PillAttributes


@dataclass(frozen=True, slots=True)
class IdentifyResult:
    """인식 결과: Vision 추출 속성 + 매칭 후보 리스트.

    ``candidates`` 가 비었거나 최고 점수가 낮으면 라우터가 재촬영을 안내한다.
    """

    attributes: PillAttributes
    candidates: list[PillCandidate] = field(default_factory=list)
