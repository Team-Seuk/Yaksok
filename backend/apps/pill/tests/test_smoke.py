"""최소 스모크 테스트 — 앱이 뜨고 /health 가 동작하는지 확인.

CI가 pytest를 실제로 돌리도록(수집 0건 방지) 두는 기본 예시이기도 하다.
같은 폴더 conftest.py 가 backend/ 를 sys.path 에 넣어줘서 `from main import app` 이 동작한다.
"""

from fastapi.testclient import TestClient

from main import app


def test_health_ok() -> None:
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
