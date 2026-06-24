"""가짜 매칭 리포지토리 — DB 없이 P3 흐름을 e2e로 돌리기 위한 `PillRepositoryPort` 더블.

실제 매칭은 P2 `PillRepository`(SQLAlchemy)가 담당한다. 이 더블은 DB 없는
테스트·오프라인 데모에서 고정 더미 후보를 돌려준다. 식별 외 메서드는 최소 구현.
"""

from __future__ import annotations

from apps.pill.app.ports.output.pill_repository import PillRepositoryPort
from apps.pill.domain.entities.pill import Pill, PillAttrs, PillCandidate

_DUMMY = [
    PillCandidate(
        item_seq="200000001",
        item_name="타이레놀정500밀리그램",
        entp_name="한국얀센",
        shape="원형",
        color_front="하양",
        color_back=None,
        print_front="T",
        print_back=None,
        image_url=None,
        is_otc=True,
        score=5.0,
    ),
    PillCandidate(
        item_seq="200000002",
        item_name="게보린정",
        entp_name="삼진제약",
        shape="원형",
        color_front="하양",
        color_back=None,
        print_front="G",
        print_back=None,
        image_url=None,
        is_otc=True,
        score=2.0,
    ),
]


class FakePillRepository(PillRepositoryPort):
    """고정 더미 후보를 점수 내림차순으로 반환하는 `PillRepositoryPort` 더블."""

    def get_by_seq(self, item_seq: str) -> Pill | None:
        return None

    def search(self, keyword: str, limit: int = 20) -> list[Pill]:
        return []

    def filter_candidates(self, attrs: PillAttrs, limit: int = 10) -> list[PillCandidate]:
        return _DUMMY[:limit]

    def upsert(self, pill: Pill) -> None:
        return None

    def upsert_many(self, pills: list[Pill]) -> None:
        return None
