"""공용 Gemini(멀티모달) 클라이언트 래퍼.

텍스트와 이미지를 함께 보낼 수 있는 얇은 호출 계층 한 곳.
각 도메인 outbound adapter 가 이 함수를 감싸 자기 port(Protocol)를 구현한다
— 식별(Vision)과 상담(LLM)이 같은 모델·키 하나를 공유한다.

SDK: google-genai (https://googleapis.github.io/python-genai/)
    from google import genai / from google.genai import types
    client = genai.Client(api_key=...)
    client.models.generate_content(model=..., contents=..., config=...)
"""

from functools import lru_cache
from typing import Any

from google import genai
from google.genai import types

from core.config import get_settings

DEFAULT_MODEL = "gemini-2.5-flash"


class GeminiError(RuntimeError):
    """Gemini 호출 실패(키 누락·API 오류·빈 응답)."""


@lru_cache
def _client() -> genai.Client:
    key = get_settings().google_api_key
    if not key:
        raise GeminiError("GOOGLE_API_KEY 가 설정되지 않았습니다 (backend/.env).")
    return genai.Client(api_key=key)


def image_part(data: bytes, mime_type: str) -> types.Part:
    """이미지 바이트를 멀티모달 입력 파트로 변환. 예: ``image_part(buf, "image/jpeg")``."""
    return types.Part.from_bytes(data=data, mime_type=mime_type)


def generate(
    contents: Any,
    *,
    model: str = DEFAULT_MODEL,
    config: types.GenerateContentConfig | None = None,
) -> str:
    """텍스트(+이미지) 입력으로 생성 결과 텍스트를 반환한다.

    ``contents`` 는 문자열, 또는 문자열·:func:`image_part` 결과를 섞은 리스트.
    구조화 JSON 출력이 필요하면 ``config`` 에
    ``types.GenerateContentConfig(response_mime_type="application/json", response_schema=...)`` 를 넘긴다.
    """
    try:
        response = _client().models.generate_content(
            model=model, contents=contents, config=config
        )
    except GeminiError:
        raise
    except Exception as exc:  # noqa: BLE001 — SDK 예외를 도메인 공통 예외로 변환
        raise GeminiError(str(exc)) from exc

    text = response.text
    if text is None:
        raise GeminiError("Gemini 응답에 텍스트가 없습니다.")
    return text
