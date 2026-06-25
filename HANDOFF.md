---
status: 개발
updated: 2026-06-25
summary: **통합 + 라이브 배포 완료 — 데모 작동 중 (2026-06-25).** 팀원 1·2·3·4 작업 전부 main 머지 + 충돌해소(프로미 명칭 유지). 공유 Neon에 낱알식별 25,315건 적재. **www.seuk.cloud(Vercel 프론트) → api(yaksok-production-9631.up.railway.app, Railway 백엔드) → Neon + Gemini** 체인이 라이브로 동작. 검증 그린: backend ruff·format·mypy(124)·import-linter(5)·pytest(31) / frontend tsc·lint·build. **후속 완료(2026-06-25, PR #23·#24·#25)**: db URL psycopg 자동 정규화 · Alembic 활성화 · 매칭 각인 우선 보정 · '오늘의 약속' 편집 화면(홈 카드→전체화면 모핑) · 홈 복약률 원그래프 · 인트로 개편 · 전역 드래그 방지 · 복약 상담 호칭 개인화(나이·성별 반영, '어르신' 단정 제거). **남은 일**: 폰 카메라 실기기 시연 · PR #22 닫기 · 매칭 실데이터 튜닝. 재배포 시 §8의 환경변수·함정 필독.
repo: Team-Seuk/Yaksok
---

> 위 frontmatter가 상태의 단일 원본. 세션 끝낼 때마다 갱신. (CONVENTIONS §4·§5)

# Yaksok — HANDOFF (통합 + 배포 완료, 2026-06-25)

## 1. 프로젝트 한눈에

**무엇**: 알약을 사진으로 찍으면 무슨 약인지 알려주고(인식), 복약 상담까지 해주는 모바일 웹앱.

**스택**: 백엔드 Python 3.12·uv·FastAPI·SQLAlchemy 2.0(psycopg **v3**)·**공유 Neon Postgres**·Google `google-genai`(Gemini `gemini-2.5-flash`, LLM·Vision 공용). 프론트 React 18·Vite·TS·react-router-dom(CRT 그린, CSS Modules).

**구조(헥사고날 `backend/apps/<도메인>/`)**: `domain` → `app`(use_cases·ports·dtos) → `adapter`(inbound api / outbound orm·repo·gemini), `dependencies`(DI), `core`(db·gemini·config). import-linter 5계약(adapter→app→domain / features 독립 / core는 features import 금지).

## 2. 지금 상태 (★ 먼저 읽기)

- **레포** `github.com/Team-Seuk/Yaksok`, 로컬 `C:/TeamSeuk/Yaksok`. origin/main = 통합+배포 완료본.
- **라이브 배포 작동 중**:
  - 프론트(Vercel): **https://www.seuk.cloud** (= seuk.cloud)
  - 백엔드(Railway): **https://yaksok-production-9631.up.railway.app** (Railway 프로젝트 `empathetic-acceptance`)
  - DB: **공유 Neon Postgres** — `pills` 25,315건 적재됨, `conversations`·`messages` 준비됨.
- **검증됨(배포본)**: 복약 상담 = 실 Gemini 답변 렌더 ✅ / 알약사전 검색·상세 = 실데이터 ✅ / `/health` 200 ✅.
- **로컬 실행**: `backend`에서 `uv sync` → `uv run uvicorn main:app --reload`(8000), `frontend`에서 `npm run dev`(5173·HTTPS). `backend/.env`에 키 3개 필요(§8).

**핵심 엔드포인트**
- `POST /api/pill/identify` (필드 `file`) — 사진→속성+후보약+`needs_retry`
- `GET /api/pill/dictionary` (목록·검색) · `GET /api/pill/dictionary/{item_seq}` (상세)
- `POST /api/guidance/conversations` · `POST|GET .../conversations/{id}/messages`
- `GET /health`

## 3. 통합 완료 내역 (DONE)

| 영역 | 한 일 |
| --- | --- |
| 팀원1 | 알약사전 조회 API(`dictionary.py`·`SearchPillsUseCase`) + 프론트(`PillDetailPage`·`AllPillsPage` API연동) + 테스트 |
| 팀원2 | 카메라 자동 스캔 루프 → Gemini Vision 인식 → `/chat` 대화 연결 |
| 팀원3 | 복약 상담 실연동(`/api/guidance/*`, 건강정보 전달) + Alembic 도입 + `connect_timeout` + 테스트 10 |
| 팀원4 | README + 배포설정(`railway.toml`·`vercel.json`) + `seuk.cloud` CORS |
| 통합·배포(팀장) | 3브랜치 머지·충돌해소, 프로미 유지, 낱알식별 API **v01→v03** 수정, **Neon 적재 25,315건**, upsert 청크화·중복제거, **Railway+Vercel 라이브 배포** |
| 후속 (2026-06-25) | §4 후속 ②③④ 완료(PR #23·#24): db URL psycopg 정규화·Alembic 활성화·매칭 각인 우선. **'오늘의 약속' 편집 화면 + 홈 복약률 원그래프 + 인트로 개편 + 전역 드래그 방지 + 복약 상담 호칭 개인화**(PR #25) |
| 검증 | backend ruff·format·mypy(124)·lint-imports(5)·pytest(31) ✅ / frontend tsc·lint·build ✅ / **배포본 상담·사전 e2e** ✅ |

## 4. 남은 일 (후속 — 데모엔 지장 없음)

> 이전 후속 ②③④(db URL 정규화·Alembic·매칭 보정)는 2026-06-25 완료(PR #23·#24) → §3·§7 반영. 아래는 남은 항목.

1. **폰 카메라 실기기 시연 테스트** — seuk.cloud(HTTPS)라 폰 카메라 인식이 동작할 것. 헤드리스론 카메라가 없어 미검증. 인식 백엔드(`/api/pill/identify`)는 검증됨(데모 사진→후보 10건). ※ 데스크톱엔 수동 업로드 버튼 없음(팀원2가 자동스캔만 남김) — 인식은 카메라 있는 기기에서.
2. **(정리) PR #22** — base가 `feat/pill-identify`로 잘못 머지됨(내용은 이미 main 통합). GitHub에서 닫으면 됨.
3. **매칭 정렬 실데이터 튜닝** — 각인 가중치 5.0은 역전 방지 최소값(PR #24). 정확한 최적값은 실데이터로 후속 튜닝. `pill_repository._score`·`identify.py` `_MIN_SCORE`·`VISION_PROMPT`.

## 5. 더미(연출용) vs 실데이터 — 시연 참고

- **실데이터/실LLM**: 대화(상담), 알약사전 목록·상세·검색(`/all-pills`·`/dictionary/:itemSeq`), 카메라 인식 결과.
- **더미(연출/스크린샷용)**: 홈 '최근 대화'·복약률 수치(원그래프는 `HomePage` `ADHERENCE` 상수), 내 기록(`/cabinet`) 약 카드. → 화면 채우기용.
- **'오늘의 약속'(실연결)**: 홈 카드 → `/today` 편집(복용 시점/타이밍/횟수/용량 수정·삭제, 새 약 추가)이 **localStorage `medications`에 저장**. 비었으면 기본 약 시드(`storage.loadMedications`, 홈·편집 공유). 새 약 '전체 사전'은 `/api/pill/dictionary` 실검색.
- 건강정보는 브라우저 **localStorage**(기기별 1인) — DB 아님. 계정/로그인 없음. **단일 사용자 시연 모델**(의도된 임시 구조).

## 6. 공통 셋업 & 검증

```bash
# 백엔드 (backend/)
uv sync
uv run uvicorn main:app --reload          # http://localhost:8000, .env의 DATABASE_URL(Neon) 필요
uv run ruff check . && uv run ruff format --check . && uv run python -m mypy && uv run python -m pytest
#  lint-imports: uv run python -c "from importlinter.cli import lint_imports; import sys; sys.exit(lint_imports())"
#  (uv run alembic / uv run lint-imports 는 이 환경서 트램폴린·디렉터리충돌로 안 됨 — python -m / -c 우회)
# 프론트 (frontend/)
npm run dev                               # https://localhost:5173 (basicSsl)
npm run build && npm run lint
```

## 7. 알아둘 함정

- **psycopg v3** — `DATABASE_URL`은 `postgresql+psycopg://...`. raw `postgresql://`·`postgres://`는 `core/config.py` field_validator가 자동으로 `+psycopg`로 정규화(PR #23) → psycopg2 크래시 방지.
- **Neon 콜드스타트** — 유휴 후 ~5-10s. `core/db.py` `connect_timeout=15`로 여유(첫 요청 한 번 느릴 수 있음).
- **SQLite 불가** — `pill_orm.raw_json`이 PG 전용 JSONB. 테스트는 DB 없이 fake(pytest 31건 DB 불필요).
- **Vision 토글 = 키** — `GOOGLE_API_KEY` 유무로 실제/fake 자동 전환.
- **색 표기 식약처 raw** — `"하양"`(O) ≠ `"흰색"`(X).
- **공공데이터 낱알식별 = v03** — `MdcinGrnIdntfcInfoService03/getMdcinGrnIdntfcInfoList03` (구 v01은 500 폐기).
- **Alembic 작동** — `backend/migrations/`(구 `alembic/`가 패키지명 가리던 문제 해소) + 의존성 추가, `main.py` lifespan에서 `upgrade head`(PR #23). 신규 DB 배포 시 스키마 자동 생성.

## 8. 배포 / 재배포 가이드 (★ 다른 세션에서 이어할 때 필독)

**아키텍처**: Vercel(seuk.cloud, 프론트 정적) → Railway(api, FastAPI) → Neon(DB) + Gemini.

**Railway (백엔드)** — 프로젝트 `empathetic-acceptance`:
- 서비스 **Root Directory = `backend`** (필수 — 루트에선 NIXPACKS가 Python 못 잡음). 설정은 `backend/railway.toml`.
- **환경변수**:
  - `DATABASE_URL` = `postgresql+psycopg://...neon.../neondb?sslmode=require` (★`+psycopg` 필수)
  - `GOOGLE_API_KEY`, `DATA_GO_KR_KEY`
  - `NIXPACKS_UV_VERSION` = `0.11.23` (★없으면 빌드 때 `pip install uv==`로 깨짐)
- Networking → Generate Domain → `yaksok-production-9631.up.railway.app` (포트 8080).
- 시작: `uv run python -m uvicorn main:app --host 0.0.0.0 --port $PORT` (railway.toml).

**Vercel (프론트)** — seuk.cloud:
- 빌드: `cd frontend && npm install && npm run build`, output `frontend/dist`, SPA rewrite(`vercel.json`).
- **환경변수 `VITE_API_BASE` = `https://yaksok-production-9631.up.railway.app`** (★빌드시 인라인 — 바꾸면 반드시 Redeploy).
- CORS는 백엔드 `main.py`에 seuk.cloud·www.seuk.cloud 허용됨.

**키·DB URL은 모두 대시보드(Railway/Vercel)·`backend/.env`에만 — git 커밋 금지.** `.env`는 gitignore.

## 9. 빠른 참조

| 경로 | 내용 |
| --- | --- |
| `backend/main.py` | 진입점·라우터·lifespan(alembic, 미작동) |
| `backend/core/{db,gemini,config}.py` | DB세션·Gemini래퍼·설정 |
| `backend/apps/pill/` | 인식(identify)·매칭(pill_repository)·사전(dictionary·search_pills) |
| `backend/apps/guidance/` | 복약 상담(LLM) + fake·테스트 |
| `backend/scripts/fetch_pills.py` | 공공데이터 적재(v03, upsert 청크) |
| `backend/railway.toml` | Railway 배포 설정 |
| `vercel.json` | Vercel 빌드/SPA 설정 |
| `frontend/src/lib/api.ts` | 백엔드 클라이언트(identify·dictionary·guidance) |
| `frontend/src/lib/{storage,cabinet}.ts` | localStorage 건강정보·복약약(`loadMedications`)·내 알약사전 더미 |
| `frontend/src/pages/{camera,chat,allpills,dictionary,cabinet,home,today,profile}/` | 화면들 (`today`=오늘의 약속 편집) |
