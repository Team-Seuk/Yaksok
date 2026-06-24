"""use_case 입출력 DTO — pydantic 없이 순수 dataclass."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MatchRequest:
    shape: str | None = None
    color_front: str | None = None
    color_back: str | None = None
    print_front: str | None = None
    print_back: str | None = None
    line_front: str | None = None
    line_back: str | None = None
    limit: int = 10


@dataclass(frozen=True)
class CandidateResult:
    item_seq: str
    item_name: str
    entp_name: str | None
    shape: str | None
    color_front: str | None
    color_back: str | None
    image_url: str | None
    is_otc: bool | None
    score: float


@dataclass(frozen=True)
class SearchRequest:
    keyword: str
    limit: int = 20


@dataclass(frozen=True)
class PillDetail:
    item_seq: str
    item_name: str
    entp_name: str | None
    is_otc: bool | None
    shape: str | None
    color_front: str | None
    color_back: str | None
    print_front: str | None
    print_back: str | None
    class_name: str | None
    form: str | None
    image_url: str | None
    efcy: str | None
    use_method: str | None
    caution: str | None
