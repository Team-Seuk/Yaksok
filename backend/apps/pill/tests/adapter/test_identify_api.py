"""POST /api/pill/identify 엔드포인트 테스트.

main.py 등록은 P1(공용구역) 담당이라, 여기선 라우터를 자체 앱에 마운트해
P3 단독으로 동작을 검증한다(통합 시 main 의 include_router 와 동일 경로).
Vision·매칭을 fake 로 **명시 주입**(dependency_overrides)해 키·DB 없이 결정적.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from apps.pill.adapter.inbound.api.v1 import router as pill_router
from apps.pill.adapter.outbound.fake_matching_adapter import FakePillRepository
from apps.pill.adapter.outbound.fake_vision_adapter import FakeVisionAdapter
from apps.pill.app.use_cases.identify_pill import IdentifyPillUseCase
from apps.pill.dependencies import get_identify_use_case


def _client() -> TestClient:
    app = FastAPI()
    app.include_router(pill_router, prefix="/api")
    app.dependency_overrides[get_identify_use_case] = lambda: IdentifyPillUseCase(
        FakeVisionAdapter(), FakePillRepository()
    )
    return TestClient(app)


def test_identify_happy_path() -> None:
    files = {"file": ("pill.jpg", b"\xff\xd8\xff\xe0fake", "image/jpeg")}
    res = _client().post("/api/pill/identify", files=files)

    assert res.status_code == 200
    body = res.json()
    assert body["attributes"]["shape"] == "원형"
    assert body["attributes"]["line_front"] == "-"
    assert len(body["candidates"]) >= 1
    assert body["candidates"][0]["item_name"]
    assert body["candidates"][0]["score"] >= body["candidates"][-1]["score"]
    assert body["needs_retry"] is False


def test_rejects_unsupported_mime() -> None:
    files = {"file": ("pill.gif", b"GIF89a", "image/gif")}
    res = _client().post("/api/pill/identify", files=files)
    assert res.status_code == 415


def test_rejects_empty_image() -> None:
    files = {"file": ("pill.jpg", b"", "image/jpeg")}
    res = _client().post("/api/pill/identify", files=files)
    assert res.status_code == 400
