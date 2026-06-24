"""Gemini Vision 어댑터 — 파서(순수 함수) + extract 배선(래퍼 monkeypatch) 테스트."""

from __future__ import annotations

import pytest

from apps.pill.adapter.outbound import gemini_vision_adapter
from apps.pill.adapter.outbound.gemini_vision_adapter import (
    GeminiVisionAdapter,
    parse_attributes,
)
from apps.pill.domain.value_objects.pill_attributes import Color, ScoreLine, Shape


def test_parses_valid_json() -> None:
    raw = (
        '{"shape":"원형","color_front":"하양","color_back":null,'
        '"imprint_front":"T","imprint_back":null,"line_front":"-","line_back":null,"form":"정제"}'
    )
    attrs = parse_attributes(raw)
    assert attrs.shape is Shape.ROUND
    assert attrs.color_front is Color.WHITE
    assert attrs.color_back is None
    assert attrs.imprint_front == "T"
    assert attrs.line_front is ScoreLine.LINE
    assert attrs.line_back is None


def test_unknown_enum_value_becomes_none() -> None:
    attrs = parse_attributes('{"shape":"별모양","color_front":"형광초록"}')
    assert attrs.shape is None
    assert attrs.color_front is None


def test_malformed_json_returns_empty_attributes() -> None:
    attrs = parse_attributes("이건 JSON 이 아님")
    assert attrs.shape is None
    assert attrs.imprint_front is None


def test_blank_imprint_normalised_to_none() -> None:
    attrs = parse_attributes('{"imprint_front":"   "}')
    assert attrs.imprint_front is None


def test_extract_wraps_core_gemini(monkeypatch: pytest.MonkeyPatch) -> None:
    """extract 가 core.gemini 래퍼를 호출하고 응답 JSON 을 속성으로 변환하는지(키 불필요)."""
    captured: dict[str, object] = {}

    def fake_generate(contents: object, *, config: object = None, **_: object) -> str:
        captured["contents"] = contents
        captured["config"] = config
        return '{"shape":"타원형","color_front":"노랑","imprint_front":"500"}'

    monkeypatch.setattr(gemini_vision_adapter.gemini, "generate", fake_generate)

    attrs = GeminiVisionAdapter().extract(b"\xff\xd8img", "image/jpeg")

    assert attrs.shape is Shape.OVAL
    assert attrs.color_front is Color.YELLOW
    assert attrs.imprint_front == "500"
    assert captured["config"] is not None  # 구조화 출력 config 전달됨
