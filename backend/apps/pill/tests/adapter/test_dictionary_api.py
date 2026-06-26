"""GET /api/pill/dictionary (목록·검색·상세) 엔드포인트 테스트.

DB 없이 fake 리포지토리를 SearchPillsUseCase 에 주입(dependency_overrides).
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from apps.pill.adapter.inbound.api.v1 import router as pill_router
from apps.pill.app.ports.output.pill_repository import PillRepositoryPort
from apps.pill.app.use_cases.search_pills import SearchPillsUseCase
from apps.pill.dependencies import get_search_pills_use_case
from apps.pill.domain.entities.pill import Pill, PillAttrs, PillCandidate

_PILLS = [
    Pill(
        item_seq="199000001",
        item_name="타이레놀정500밀리그램",
        entp_name="한국얀센",
        is_otc=True,
        shape="장방형",
        color_front="하양",
        print_front="TYLENOL",
        form="정제",
        class_name="해열·진통·소염제",
        efcy="감기로 인한 발열 및 통증",
        use_method="1회 1~2정",
        caution="하루 4g 초과 금지",
    ),
    Pill(
        item_seq="199000002",
        item_name="게보린정",
        entp_name="삼진제약",
        is_otc=True,
        shape="원형",
        color_front="하양",
    ),
]


class _FakeRepo(PillRepositoryPort):
    """SearchPillsUseCase 가 쓰는 메서드만 동작하는 PillRepositoryPort 더블."""

    def get_by_seq(self, item_seq: str) -> Pill | None:
        return next((p for p in _PILLS if p.item_seq == item_seq), None)

    def search(self, keyword: str, limit: int = 20) -> list[Pill]:
        kw = keyword.strip().lower()
        hits = [p for p in _PILLS if kw in p.item_name.lower()] if kw else list(_PILLS)
        return hits[:limit]

    def search_candidates(self, keyword: str, limit: int = 10) -> list[PillCandidate]:
        return []

    def filter_candidates(self, attrs: PillAttrs, limit: int = 10) -> list[PillCandidate]:
        return []

    def upsert(self, pill: Pill) -> None:
        return None

    def upsert_many(self, pills: list[Pill]) -> None:
        return None


def _client() -> TestClient:
    app = FastAPI()
    app.include_router(pill_router, prefix="/api")
    app.dependency_overrides[get_search_pills_use_case] = lambda: SearchPillsUseCase(_FakeRepo())
    return TestClient(app)


def test_list_all() -> None:
    res = _client().get("/api/pill/dictionary")
    assert res.status_code == 200
    names = [p["item_name"] for p in res.json()]
    assert "타이레놀정500밀리그램" in names
    assert "게보린정" in names


def test_search_by_keyword() -> None:
    res = _client().get("/api/pill/dictionary", params={"q": "타이레놀"})
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 1
    assert body[0]["item_seq"] == "199000001"


def test_detail_found() -> None:
    res = _client().get("/api/pill/dictionary/199000001")
    assert res.status_code == 200
    body = res.json()
    assert body["item_name"] == "타이레놀정500밀리그램"
    assert body["efcy"] == "감기로 인한 발열 및 통증"


def test_detail_not_found() -> None:
    res = _client().get("/api/pill/dictionary/000000000")
    assert res.status_code == 404
