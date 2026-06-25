"""알약사전 조회 입력(구동) 포트 — 라우터(inbound)가 호출하는 인터페이스.

identify 와 동일하게 구동 포트는 ABC: 구현체(use_case)가 명시 상속한다.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from apps.pill.app.dtos.pill_dto import PillDetail, SearchRequest


class SearchPillsPort(ABC):
    @abstractmethod
    def search(self, req: SearchRequest) -> list[PillDetail]:
        """키워드로 알약 목록 조회(키워드 비면 전체)."""
        ...

    @abstractmethod
    def get_detail(self, item_seq: str) -> PillDetail | None:
        """품목기준코드로 상세 1건(없으면 None)."""
        ...
