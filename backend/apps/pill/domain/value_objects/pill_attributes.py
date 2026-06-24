"""알약 식별 속성(value object) + 식약처 낱알식별 분류 enum.

Vision(사진→속성)과 매칭(속성→후보 약)이 **공유하는 계약**이다.
값은 식품의약품안전처 '의약품 낱알식별 정보' 분류 체계를 그대로 따른다
(모양 DRUG_SHAPE · 색상 COLOR_CLASS · 분할선 LINE). 자유서술이 아니라
정해진 enum 값으로만 표현해 P2 매칭의 검색 파라미터와 1:1 대응시킨다.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class Shape(StrEnum):
    """낱알 모양 (DRUG_SHAPE)."""

    ROUND = "원형"
    OVAL = "타원형"
    OBLONG = "장방형"
    SEMICIRCLE = "반원형"
    TRIANGLE = "삼각형"
    SQUARE = "사각형"
    DIAMOND = "마름모형"
    PENTAGON = "오각형"
    HEXAGON = "육각형"
    OCTAGON = "팔각형"
    OTHER = "기타"


class Color(StrEnum):
    """낱알 색상 (COLOR_CLASS1/2)."""

    WHITE = "하양"
    YELLOW = "노랑"
    ORANGE = "주황"
    PINK = "분홍"
    RED = "빨강"
    BROWN = "갈색"
    LIGHT_GREEN = "연두"
    GREEN = "초록"
    TEAL = "청록"
    BLUE = "파랑"
    NAVY = "남색"
    MAGENTA = "자주"
    PURPLE = "보라"
    GRAY = "회색"
    BLACK = "검정"
    TRANSPARENT = "투명"
    OTHER = "기타"


class ScoreLine(StrEnum):
    """분할선 표기 (LINE_FRONT/BACK). 식약처 raw 값과 일치시킨다.

    분할선이 없으면 enum 값이 아니라 ``None`` 으로 둔다(매칭에서 제외).
    """

    LINE = "-"  # 가로 1분할선
    CROSS = "+"  # 십자 분할선


class Form(StrEnum):
    """제형 추정 (FORM_CODE_NAME 일부)."""

    TABLET = "정제"
    HARD_CAPSULE = "경질캡슐"
    SOFT_CAPSULE = "연질캡슐"
    OTHER = "기타"


@dataclass(frozen=True, slots=True)
class PillAttributes:
    """사진에서 추출한 알약의 물리적 속성.

    앞/뒤를 구분하는 항목은 각각 보관한다(낱알식별 API가 앞/뒤를 따로 검색).
    추출 불가한 항목은 ``None`` — 매칭 단계에서 해당 조건을 제외한다.
    """

    shape: Shape | None = None
    color_front: Color | None = None
    color_back: Color | None = None
    imprint_front: str | None = None
    imprint_back: str | None = None
    line_front: ScoreLine | None = None
    line_back: ScoreLine | None = None
    form: Form | None = None
