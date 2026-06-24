"""Pill 도메인 엔티티 — 순수 파이썬, 외부 의존 없음."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class PillAttrs:
    """P3 Vision이 채워주는 식별 속성. 없는 필드는 None."""

    shape: str | None = None
    color_front: str | None = None
    color_back: str | None = None
    print_front: str | None = None
    print_back: str | None = None
    line_front: str | None = None
    line_back: str | None = None


@dataclass(frozen=True)
class PillCandidate:
    """매칭 결과 후보 한 건."""

    item_seq: str
    item_name: str
    entp_name: str | None
    shape: str | None
    color_front: str | None
    color_back: str | None
    print_front: str | None
    print_back: str | None
    image_url: str | None
    is_otc: bool | None
    score: float  # 높을수록 일치도 높음


@dataclass(frozen=True)
class Pill:
    """pills 테이블 전체 컬럼을 담는 도메인 객체."""

    item_seq: str
    item_name: str
    entp_name: str | None = None
    is_otc: bool | None = None
    shape: str | None = None
    color_front: str | None = None
    color_back: str | None = None
    print_front: str | None = None
    print_back: str | None = None
    line_front: str | None = None
    line_back: str | None = None
    leng_long: str | None = None
    leng_short: str | None = None
    thick: str | None = None
    class_name: str | None = None
    form: str | None = None
    chart: str | None = None
    image_url: str | None = None
    efcy: str | None = None
    use_method: str | None = None
    caution: str | None = None
    extra: dict = field(default_factory=dict)  # raw_json 추가 필드
