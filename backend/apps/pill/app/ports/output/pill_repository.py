"""리포지토리 포트 — use_case가 의존하는 추상 인터페이스(Protocol)."""

from __future__ import annotations

from typing import Protocol

from apps.pill.domain.entities.pill import Pill, PillAttrs, PillCandidate


class PillRepositoryPort(Protocol):
    def get_by_seq(self, item_seq: str) -> Pill | None: ...

    def search(self, keyword: str, limit: int = 20) -> list[Pill]: ...

    def filter_candidates(self, attrs: PillAttrs, limit: int = 10) -> list[PillCandidate]: ...

    def upsert(self, pill: Pill) -> None: ...

    def upsert_many(self, pills: list[Pill]) -> None: ...
