"""속성 → 후보 약 매칭 use_case."""

from __future__ import annotations

from apps.pill.app.dtos.pill_dto import CandidateResult, MatchRequest
from apps.pill.app.ports.output.pill_repository import PillRepositoryPort
from apps.pill.domain.entities.pill import PillAttrs


class MatchCandidatesUseCase:
    def __init__(self, repo: PillRepositoryPort) -> None:
        self._repo = repo

    def execute(self, req: MatchRequest) -> list[CandidateResult]:
        attrs = PillAttrs(
            shape=req.shape,
            color_front=req.color_front,
            color_back=req.color_back,
            print_front=req.print_front,
            print_back=req.print_back,
            line_front=req.line_front,
            line_back=req.line_back,
        )
        candidates = self._repo.filter_candidates(attrs, limit=req.limit)
        return [
            CandidateResult(
                item_seq=c.item_seq,
                item_name=c.item_name,
                entp_name=c.entp_name,
                shape=c.shape,
                color_front=c.color_front,
                color_back=c.color_back,
                image_url=c.image_url,
                is_otc=c.is_otc,
                score=c.score,
            )
            for c in candidates
        ]
