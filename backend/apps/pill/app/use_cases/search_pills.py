"""알약사전 검색·상세 조회 use_case."""

from __future__ import annotations

from apps.pill.app.dtos.pill_dto import PillDetail, SearchRequest
from apps.pill.app.ports.output.pill_repository import PillRepositoryPort


class SearchPillsUseCase:
    def __init__(self, repo: PillRepositoryPort) -> None:
        self._repo = repo

    def search(self, req: SearchRequest) -> list[PillDetail]:
        pills = self._repo.search(req.keyword, limit=req.limit)
        return [_to_detail(p) for p in pills]

    def get_detail(self, item_seq: str) -> PillDetail | None:
        pill = self._repo.get_by_seq(item_seq)
        return _to_detail(pill) if pill else None


def _to_detail(p: object) -> PillDetail:
    from apps.pill.domain.entities.pill import Pill

    assert isinstance(p, Pill)
    return PillDetail(
        item_seq=p.item_seq,
        item_name=p.item_name,
        entp_name=p.entp_name,
        is_otc=p.is_otc,
        shape=p.shape,
        color_front=p.color_front,
        color_back=p.color_back,
        print_front=p.print_front,
        print_back=p.print_back,
        class_name=p.class_name,
        form=p.form,
        image_url=p.image_url,
        efcy=p.efcy,
        use_method=p.use_method,
        caution=p.caution,
    )
