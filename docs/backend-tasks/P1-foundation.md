# P1 — 공통 기반 / 플랫폼

> 상태: **핵심 구현 완료** (브랜치 `feat/backend-foundation`). 잔여(ORM 모델·Alembic·DI 예시)는 아래 참고.
> 전체 그림·계약은 [README](README.md) 먼저.

## 담당 영역 (공용구역 단독 소유)
`backend/core/`, `backend/main.py`, `backend/pyproject.toml`, `backend/.env.example`.

## 완료된 것
- `core/config.py`: `google_api_key`, `database_url` 추가.
- `core/db.py`: SQLAlchemy 2.0 `engine`·`SessionLocal`·`Base`·`get_db()`. 지연 연결.
- `core/gemini.py`: 공용 멀티모달 래퍼 `generate(contents, *, model, config)` + `image_part(bytes, mime)`. 키 누락 시 `GeminiError`.
- `.env.example`: `GOOGLE_API_KEY`(+`DATABASE_URL`).
- `pyproject.toml`: `google-genai`·`sqlalchemy`·`psycopg[binary]` + google-genai mypy override.
- 검증: ruff/mypy(82)/lint-imports(5 KEPT)/pytest(1) 그린.

## 잔여 작업
- [ ] **라우터 등록 규약 확정** — `main.py`에서 `app.include_router(<도메인>_router, prefix="/api")`. 도메인 트랙이 라우터를 만들면 여기 연결(또는 각 도메인이 PR로).
- [ ] **DI 패턴 예시** 제공 — 라우터가 `adapter/outbound` 구현체를 만들어 use_case에 주입하는 표준형(아래 스니펫을 합의안으로).
- [ ] **Alembic** 초기화 — 첫 ORM 모델이 생기면 `env.py`가 `core.db.Base.metadata`를 보도록 설정 + 초기 마이그레이션. (모델 0개일 땐 보류가 합리적.)
- [ ] 전역 에러 핸들러(외부 API 실패·검증 실패 → 일관 JSON).
- [ ] (선택) auth 시드 dev 유저 — ERD상 프로토타입은 본격 인증 생략.

## 표준 DI 패턴 (모든 도메인이 따를 형태)
```python
# app/ports/output/llm.py        — 추상(계약). app은 이것만 안다.
from typing import Protocol
class LlmPort(Protocol):
    def ask(self, prompt: str) -> str: ...

# adapter/outbound/gemini_llm.py  — 구현. 외부 SDK는 여기서만.
from core import gemini
from apps.guidance.app.ports.output.llm import LlmPort
class GeminiLlm(LlmPort):
    def ask(self, prompt: str) -> str:
        return gemini.generate(prompt)

# app/use_cases/ask_guidance.py   — port에만 의존, 주입받음.
class AskGuidance:
    def __init__(self, llm: LlmPort) -> None: self._llm = llm
    def run(self, prompt: str) -> str: return self._llm.ask(prompt)

# adapter/inbound/api/v1/__init__.py — 조립 + 라우터.
from fastapi import APIRouter
router = APIRouter()
@router.post("/guidance/ask")
def ask(q: str) -> dict[str, str]:
    return {"answer": AskGuidance(GeminiLlm()).run(q)}
```

## 검증
```bash
cd backend && uv sync
uv run ruff check . && uv run mypy && uv run lint-imports && uv run pytest
uv run uvicorn main:app --reload   # /health
```
