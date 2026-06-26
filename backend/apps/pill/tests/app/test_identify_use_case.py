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


def test_box_product_name_routes_to_name_search() -> None:
    """포장 인식 — Vision 이 product_name 을 읽으면 이름검색 후보로 분기한다(속성매칭 더미 아님)."""
    box = PillAttributes(product_name="타이레놀")
    use_case = IdentifyPillUseCase(FakeVisionAdapter(box), FakePillRepository())

    result = use_case.execute(b"box-image", "image/jpeg")

    assert result.attributes.product_name == "타이레놀"
    # FakePillRepository.search_candidates 는 키워드를 담은 더미를 돌려준다.
    assert result.candidates[0].item_name == "타이레놀정"
    assert result.candidates[0].item_seq == "900000001"


def test_pill_without_product_name_uses_attribute_match() -> None:
    """낱알 — product_name 이 없으면 기존 물리속성 매칭(더미 후보)을 그대로 쓴다."""
    use_case = IdentifyPillUseCase(FakeVisionAdapter(), FakePillRepository())

    result = use_case.execute(b"pill-image", "image/jpeg")

    assert result.attributes.product_name is None
    # 속성매칭 더미(_DUMMY)의 첫 후보.
    assert result.candidates[0].item_seq == "200000001"
