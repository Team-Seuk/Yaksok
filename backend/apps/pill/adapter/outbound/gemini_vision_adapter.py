"""Gemini Vision 어댑터 — P1 공용 래퍼(`core.gemini`)로 사진→속성 추출, VisionPort 구현.

설계(P3):
- 외부 SDK(google-genai) 호출은 **P1 공용 래퍼 `core.gemini`** 한 곳을 거친다(계약).
  이 어댑터는 그 래퍼를 감싸 ``VisionPort`` 를 구현한다.
- 프롬프트에 식약처 낱알식별 분류(모양/색 enum)를 명시 + ``response_schema`` 로
  **구조화 JSON 출력**을 강제해 자유서술이 아니라 정해진 값으로 뽑는다.
- 파싱은 관대하게(없거나 허용 외 값은 None) — 모델 오차에 견딘다.
"""

from __future__ import annotations

import json
from enum import Enum
from typing import Any

from google.genai import types
from pydantic import BaseModel

from apps.pill.app.ports.output.vision_port import VisionPort
from apps.pill.domain.value_objects.pill_attributes import (
    Color,
    Form,
    PillAttributes,
    ScoreLine,
    Shape,
)
from core import gemini

# 모델에 허용하는 enum 값을 프롬프트에 그대로 노출(자유서술 방지).
_SHAPES = " · ".join(s.value for s in Shape)
_COLORS = " · ".join(c.value for c in Color)
_LINES = " · ".join(s.value for s in ScoreLine)
_FORMS = " · ".join(f.value for f in Form)

VISION_PROMPT = f"""당신은 한국 의약품 식별 보조원입니다.
주어진 사진 1장을 보고 아래 항목을 판별하세요. 맨 알약의 약 이름·효능은 추측하지 마세요
(단, 포장에 인쇄된 제품명은 product_name 으로 그대로 옮겨 적습니다).

[1] 맨 알약(낱알)이 보이면 물리적 속성을 정해진 값 중에서만 고르세요(알아볼 수 없으면 null).
- shape(모양): {_SHAPES}
- color_front / color_back(색, 앞/뒤): {_COLORS}
- line_front / line_back(분할선, 앞/뒤): {_LINES} (가로 분할선=`-`, 십자=`+`). 분할선이 없으면 null.
- form(제형 추정): {_FORMS}
- imprint_front / imprint_back(각인, 앞/뒤): 알약에 새겨진 글자·숫자·기호를 그대로. 없으면 null.
한쪽 면만 보이면 보이는 면을 front 로, 반대 면은 null 로 두세요.

[2] 포장(상자·블리스터·라벨 등)에 약 제품명이 인쇄돼 있으면 product_name 에 그 제품명을 그대로
적으세요(가장 크고 분명한 제품명 한 개, 인쇄된 글자만 — 추측·번역 금지). 용량/제조사/효능 문구는
빼고 제품명 위주로. 포장이 없거나 제품명 글자가 안 보이면 product_name 은 null."""


class _VisionAttrsSchema(BaseModel):
    """Gemini 구조화 출력 강제용 응답 스키마(전부 선택)."""

    shape: str | None = None
    color_front: str | None = None
    color_back: str | None = None
    imprint_front: str | None = None
    imprint_back: str | None = None
    line_front: str | None = None
    line_back: str | None = None
    form: str | None = None
    product_name: str | None = None


def _to_enum[E: Enum](enum_cls: type[E], raw: Any) -> E | None:
    """모델이 준 문자열을 enum 으로. 미상/비허용 값은 None."""
    if not isinstance(raw, str):
        return None
    try:
        return enum_cls(raw.strip())
    except ValueError:
        return None


def _to_imprint(raw: Any) -> str | None:
    if not isinstance(raw, str):
        return None
    text = raw.strip()
    return text or None


def parse_attributes(raw_json: str) -> PillAttributes:
    """Gemini 가 돌려준 JSON 문자열 → PillAttributes. 손상/누락에 관대하게(없으면 None)."""
    try:
        data: Any = json.loads(raw_json)
    except json.JSONDecodeError:
        return PillAttributes()
    if not isinstance(data, dict):
        return PillAttributes()
    return PillAttributes(
        shape=_to_enum(Shape, data.get("shape")),
        color_front=_to_enum(Color, data.get("color_front")),
        color_back=_to_enum(Color, data.get("color_back")),
        imprint_front=_to_imprint(data.get("imprint_front")),
        imprint_back=_to_imprint(data.get("imprint_back")),
        line_front=_to_enum(ScoreLine, data.get("line_front")),
        line_back=_to_enum(ScoreLine, data.get("line_back")),
        form=_to_enum(Form, data.get("form")),
        product_name=_to_imprint(data.get("product_name")),
    )


class GeminiVisionAdapter(VisionPort):
    """``VisionPort`` 구현 — `core.gemini` 멀티모달 호출 후 속성 파싱."""

    def extract(self, image_bytes: bytes, mime_type: str) -> PillAttributes:
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_VisionAttrsSchema,
        )
        raw = gemini.generate(
            [VISION_PROMPT, gemini.image_part(image_bytes, mime_type)],
            config=config,
        )
        return parse_attributes(raw)
