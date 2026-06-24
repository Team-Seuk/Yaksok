# 백엔드 구축 작업 — 에이전트/기여자 가이드

> **이 문서를 읽는 Claude(또는 사람)에게**: Yaksok 백엔드를 4개 트랙(P1~P4)으로 나눠 구축 중이다.
> 너는 보통 그중 **한 트랙**을 맡는다. 먼저 이 문서로 전체 그림·계약·공용 기반을 파악한 뒤,
> 네 트랙 문서([P1](P1-foundation.md) · [P2](P2-data-matching.md) · [P3](P3-pill-vision.md) · [P4](P4-guidance.md))를 펼쳐라.
> 큰 그림·문서 규칙은 상위 [`../../AGENTS.md`](../../AGENTS.md) · [`../../CONVENTIONS.md`](../../CONVENTIONS.md), 현재 상태는 [`../../HANDOFF.md`](../../HANDOFF.md).

## 지금 상태 (요약)
- 백엔드는 헥사고날 **빈 스캐폴드**였고, **P1 공용 기반은 이미 구현됨**(브랜치 `feat/backend-foundation`, 미머지일 수 있음 — `git log`/PR 확인).
- 프론트는 더미·localStorage. `frontend/src/api/` 비어 있음.
- 목표: 카메라 사진 → 알약 식별, 복약 상담 챗을 **실제 Gemini + DB**로 동작.

## 아키텍처 (헥사고날 feature-first)
```
backend/
  main.py                  # FastAPI 진입점, 라우터 등록, CORS, /health
  core/                    # 공용구역(위험). P1 단독 소유.
    config.py              # pydantic-settings (google_api_key, database_url, ...)
    db.py                  # SQLAlchemy engine/SessionLocal/Base/get_db
    gemini.py              # 공용 Gemini 멀티모달 래퍼 (LLM·Vision 공유)
  apps/<도메인>/           # auth · pill · guidance
    adapter/inbound/api/   # FastAPI 라우터·요청응답 스키마  (가장 바깥)
    adapter/outbound/      # DB 리포지토리·외부 API(Gemini 등) 어댑터
    app/                   # use_cases · ports(input/output) · dtos
    domain/                # entities · value_objects (가장 안쪽, 순수)
    tests/
```

## 절대 지켜야 할 계약 (import-linter — CI에서 검사)
1. **계층 방향**: 도메인마다 `adapter → app → domain`. 역방향 import 금지.
   - 즉 use_case(app)는 **port(Protocol)에만** 의존하고, 구현(adapter/outbound)은 **주입(DI)** 받는다.
2. **도메인 독립**: `apps.auth` / `apps.pill` / `apps.guidance` **상호 import 금지**. 공유는 `core`로.
3. **core 격리**: `core`는 `apps`를 import 못 함. (단 `apps`→`core`는 OK → 그래서 공용 Gemini가 core에 있다.)
4. **외부 SDK 호출은 outbound adapter에서만.** (google-genai, 공공API, DB 등)

위반하면 `lint-imports`가 빨갛게 뜨고 머지 불가.

## 공용 기반 사용법 (P1이 깔아둔 것)

### Gemini (LLM·Vision 공용) — `core/gemini.py`
```python
from core import gemini
from google.genai import types

# 1) 텍스트
answer = gemini.generate("타이레놀 공복 복용 괜찮아?")

# 2) 멀티모달 (사진 + 지시문)
answer = gemini.generate(["이 알약의 모양·색·각인을 알려줘", gemini.image_part(img_bytes, "image/jpeg")])

# 3) 구조화 JSON 출력 (식별 속성 추출 등)
cfg = types.GenerateContentConfig(response_mime_type="application/json", response_schema=...)
raw = gemini.generate(contents, config=cfg)   # JSON 문자열
```
- 키 없으면 `gemini.GeminiError`. **직접 호출하지 말고**, 네 도메인 `adapter/outbound`에서 감싸 port로 노출해라(계약).

### DB — `core/db.py`
```python
from core.db import Base, get_db          # ORM 베이스 + FastAPI 세션 의존성
from sqlalchemy.orm import Mapped, mapped_column

class Pill(Base):                          # 모델은 네 도메인 adapter/outbound/orm/ 에
    __tablename__ = "pills"
    item_seq: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str]

# 라우터에서:  def endpoint(db: Session = Depends(get_db)): ...
```
- 엔진은 **지연 연결** — Postgres 없어도 서버는 뜬다. 실제 쿼리할 때만 연결.

## 트랙 의존·순서
- **P1**(완료) → P2/P3/P4 병렬. **P3는 P2 매칭을 스텁으로 두고 시작**(블록 금지).
- Day0에 P1 주도로 **port 시그니처·요청/응답 스키마** 합의한 게 기준. 바꾸려면 다 같이.

## 일하는 법 (이 repo 규칙)
- **브랜치**: `main` 직접 금지 → `feat/<주제>` → PR → 승인 → merge.
- **공용구역**(`core/`·`main.py`·`pyproject.toml`·`.env.example`) 변경은 **P1만**. 다른 트랙이 필요하면 P1에게 요청.
- **검증(PR 전 필수)**:
  ```bash
  cd backend && uv sync
  uv run ruff check . && uv run mypy && uv run lint-imports && uv run pytest
  uv run uvicorn main:app --reload   # http://127.0.0.1:8000/health
  ```
- 시크릿은 `backend/.env`에만(`GOOGLE_API_KEY`, `DATA_GO_KR_KEY`). 커밋·로그 금지.
- ERD(12테이블)는 [`../ERD.md`](../ERD.md).

## 작업 끝낼 때
- [`../../HANDOFF.md`](../../HANDOFF.md) 갱신(마지막 작업/다음 할 일 + frontmatter `updated`·`summary`). 굵직하면 [`../../LOG.md`](../../LOG.md) 한 줄.
- 네 트랙 문서의 체크리스트도 진행 상태를 반영해라.
