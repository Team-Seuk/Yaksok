"""매칭 use_case 단위 테스트 — DB 없이 샘플 데이터로."""

from __future__ import annotations

from apps.pill.app.dtos.pill_dto import MatchRequest
from apps.pill.app.use_cases.match_candidates import MatchCandidatesUseCase
from apps.pill.domain.entities.pill import Pill, PillAttrs, PillCandidate

# ── 샘플 약 데이터 ──────────────────────────────────────────────────────────
SAMPLE_PILLS = [
    Pill(
        item_seq="111111111",
        item_name="타이레놀정500밀리그램",
        entp_name="한국얀센",
        is_otc=True,
        shape="장방형",
        color_front="흰색",
        color_back=None,
        print_front="TYLENOL",
        print_back=None,
    ),
    Pill(
        item_seq="222222222",
        item_name="이부프로펜정200밀리그램",
        entp_name="동아제약",
        is_otc=True,
        shape="원형",
        color_front="흰색",
        color_back=None,
        print_front="IBU200",
        print_back=None,
    ),
    Pill(
        item_seq="333333333",
        item_name="아스피린정100밀리그램",
        entp_name="바이엘코리아",
        is_otc=True,
        shape="원형",
        color_front="흰색",
        color_back=None,
        print_front="BAYER",
        print_back=None,
        line_front="+",
    ),
]


# ── 가짜 리포지토리 ─────────────────────────────────────────────────────────
class FakeRepo:
    def __init__(self, pills: list[Pill]) -> None:
        self._pills = pills

    def get_by_seq(self, item_seq: str) -> Pill | None:
        return next((p for p in self._pills if p.item_seq == item_seq), None)

    def search(self, keyword: str, limit: int = 20) -> list[Pill]:
        kw = keyword.lower()
        return [p for p in self._pills if kw in p.item_name.lower()][:limit]

    def filter_candidates(self, attrs: PillAttrs, limit: int = 10) -> list[PillCandidate]:
        from apps.pill.adapter.outbound.repositories.pill_repository import _score

        results = []
        for p in self._pills:
            # 가짜 ORM row처럼 동작하는 객체
            class _FakeRow:
                item_seq = p.item_seq
                item_name = p.item_name
                entp_name = p.entp_name
                shape = p.shape
                color_front = p.color_front
                color_back = p.color_back
                print_front = p.print_front
                print_back = p.print_back
                line_front = getattr(p, "line_front", None)
                line_back = getattr(p, "line_back", None)
                image_url = p.image_url
                is_otc = p.is_otc

            score = _score(_FakeRow(), attrs)  # type: ignore[arg-type]
            if score > 0:
                results.append(
                    PillCandidate(
                        item_seq=p.item_seq,
                        item_name=p.item_name,
                        entp_name=p.entp_name,
                        shape=p.shape,
                        color_front=p.color_front,
                        color_back=p.color_back,
                        print_front=p.print_front,
                        print_back=p.print_back,
                        image_url=p.image_url,
                        is_otc=p.is_otc,
                        score=score,
                    )
                )
        return sorted(results, key=lambda c: c.score, reverse=True)[:limit]

    def upsert(self, pill: Pill) -> None:
        pass

    def upsert_many(self, pills: list[Pill]) -> None:
        pass


# ── 테스트 ──────────────────────────────────────────────────────────────────


def test_match_by_print_front_exact() -> None:
    """각인 완전일치 → 해당 약이 1순위."""
    repo = FakeRepo(SAMPLE_PILLS)
    uc = MatchCandidatesUseCase(repo)

    results = uc.execute(MatchRequest(print_front="TYLENOL", shape="장방형", color_front="흰색"))

    assert results, "결과가 비어있음"
    assert results[0].item_seq == "111111111"
    assert results[0].score > results[1].score if len(results) > 1 else True


def test_match_print_normalization() -> None:
    """각인 공백·대소문자 정규화 후 일치."""
    repo = FakeRepo(SAMPLE_PILLS)
    uc = MatchCandidatesUseCase(repo)

    results = uc.execute(MatchRequest(print_front="tylenol"))  # 소문자로 넣어도

    assert results
    assert results[0].item_seq == "111111111"


def test_match_no_attrs_returns_empty() -> None:
    """속성 없이 호출하면 결과 없음(스코어 0 제외)."""
    repo = FakeRepo(SAMPLE_PILLS)
    uc = MatchCandidatesUseCase(repo)

    results = uc.execute(MatchRequest())
    assert results == []


def test_search_by_keyword() -> None:
    """이름 키워드 검색."""
    from apps.pill.app.dtos.pill_dto import SearchRequest
    from apps.pill.app.use_cases.search_pills import SearchPillsUseCase

    repo = FakeRepo(SAMPLE_PILLS)
    uc = SearchPillsUseCase(repo)

    results = uc.search(SearchRequest(keyword="타이레놀"))
    assert len(results) == 1
    assert results[0].item_seq == "111111111"


def test_get_detail_found() -> None:
    from apps.pill.app.use_cases.search_pills import SearchPillsUseCase

    repo = FakeRepo(SAMPLE_PILLS)
    uc = SearchPillsUseCase(repo)

    detail = uc.get_detail("222222222")
    assert detail is not None
    assert detail.item_name == "이부프로펜정200밀리그램"


def test_get_detail_not_found() -> None:
    from apps.pill.app.use_cases.search_pills import SearchPillsUseCase

    repo = FakeRepo(SAMPLE_PILLS)
    uc = SearchPillsUseCase(repo)

    assert uc.get_detail("999999999") is None
