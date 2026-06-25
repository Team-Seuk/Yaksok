"""POST/GET /api/guidance/* 엔드포인트 테스트.

LLM·DB를 fake로 주입해 키·DB 없이 결정적으로 동작한다.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from apps.guidance.adapter.inbound.api.v1.router import router as guidance_router
from apps.guidance.adapter.outbound.fake_conversation_repository import FakeConversationRepository
from apps.guidance.adapter.outbound.fake_llm_adapter import FakeLLMAdapter
from apps.guidance.app.use_cases import AskGuidanceUseCase
from apps.guidance.dependencies import get_ask_guidance_use_case, get_conversation_repo

_FAKE_REPLY = "테스트 답변입니다."
_fake_repo = FakeConversationRepository()


def _client() -> TestClient:
    app = FastAPI()
    app.include_router(guidance_router)
    app.dependency_overrides[get_conversation_repo] = lambda: _fake_repo
    app.dependency_overrides[get_ask_guidance_use_case] = lambda: AskGuidanceUseCase(
        llm=FakeLLMAdapter(reply=_FAKE_REPLY),
        repo=_fake_repo,
    )
    return TestClient(app)


def test_create_conversation() -> None:
    res = _client().post("/api/guidance/conversations")
    assert res.status_code == 200
    body = res.json()
    assert "id" in body
    assert "created_at" in body


def test_send_message_and_get_reply() -> None:
    client = _client()
    conv_id = client.post("/api/guidance/conversations").json()["id"]

    res = client.post(
        f"/api/guidance/conversations/{conv_id}/messages",
        json={"message": "타이레놀 먹어도 될까요?"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["content"] == _FAKE_REPLY
    assert body["role"] == "assistant"


def test_send_message_with_health_info() -> None:
    client = _client()
    conv_id = client.post("/api/guidance/conversations").json()["id"]

    res = client.post(
        f"/api/guidance/conversations/{conv_id}/messages",
        json={
            "message": "이 약 먹어도 되나요?",
            "health_info": {
                "allergies": ["아스피린"],
                "is_pregnant": True,
                "current_medications": ["철분제"],
            },
        },
    )
    assert res.status_code == 200
    assert res.json()["content"] == _FAKE_REPLY


def test_unknown_conversation_returns_404() -> None:
    res = _client().post(
        "/api/guidance/conversations/nonexistent-id/messages",
        json={"message": "안녕"},
    )
    assert res.status_code == 404


def test_get_messages_after_send() -> None:
    client = _client()
    conv_id = client.post("/api/guidance/conversations").json()["id"]
    client.post(
        f"/api/guidance/conversations/{conv_id}/messages",
        json={"message": "질문입니다"},
    )

    res = client.get(f"/api/guidance/conversations/{conv_id}/messages")
    assert res.status_code == 200
    msgs = res.json()
    assert len(msgs) == 2
    assert msgs[0]["role"] == "user"
    assert msgs[1]["role"] == "assistant"
