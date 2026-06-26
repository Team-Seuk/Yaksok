"""리포지토리 포트 — use_case가 의존하는 추상 인터페이스(ABC)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from apps.pill.domain.entities.pill import Pill, PillAttrs, PillCandidate


class PillRepositoryPort(ABC):
    @abstractmethod
    def get_by_seq(self, item_seq: str) -> Pill | None: ...

    @abstractmethod
    def search(self, keyword: str, limit: int = 20) -> list[Pill]: ...

    @abstractmethod
    def search_candidates(self, keyword: str, limit: int = 10) -> list[PillCandidate]:
        """제품명(이름)으로 검색한 후보 — 포장 인식 경로용. 이름 일치도를 score 로 채운다."""
        ...

    @abstractmethod
    def filter_candidates(self, attrs: PillAttrs, limit: int = 10) -> list[PillCandidate]: ...

    @abstractmethod
    def upsert(self, pill: Pill) -> None: ...

    @abstractmethod
    def upsert_many(self, pills: list[Pill]) -> None: ...
