"""IdentifyPillUseCase 단위 테스트 — fake Vision + fake 매칭 리포로 파이프라인 검증."""

from __future__ import annotations

from apps.pill.adapter.outbound.fake_matching_adapter import FakePillRepository
from apps.pill.adapter.outbound.fake_vision_adapter import FakeVisionAdapter
from apps.pill.app.use_cases.identify_pill import IdentifyPillUseCase
from apps.pill.domain.value_objects.pill_attributes import PillAttributes, Shape


def test_execute_returns_attributes_and_candidates() -> None:
    use_case = IdentifyPillUseCase(FakeVisionAdapter(), FakePillRepository())

    result = use_case.execute(b"fake-image-bytes", "image/jpeg")

    assert result.attributes.shape is Shape.ROUND
    assert len(result.candidates) >= 1
    assert result.candidates[0].score >= result.candidates[-1].score
    assert result.candidates[0].item_name


def test_uses_injected_vision_attributes() -> None:
    custom = PillAttributes(shape=Shape.OVAL, imprint_front="X")
    use_case = IdentifyPillUseCase(FakeVisionAdapter(custom), FakePillRepository())

    result = use_case.execute(b"img", "image/png")

    assert result.attributes.shape is Shape.OVAL
    assert result.attributes.imprint_front == "X"
