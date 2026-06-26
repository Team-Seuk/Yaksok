---
status: 개발
updated: 2026-06-26
summary: **통합 + 라이브 배포 완료 — 데모 작동 중.** **www.seuk.cloud(Vercel) → api(Railway) → Neon + Gemini(유료 키)** 라이브. 공유 Neon **27,330건**(낱알식별 25,315 + e약은요 전용 신규 2,015), 효능·용법·주의 채워짐 **4,770건**. **2026-06-26 개편(PR #27~#41)**: 카메라 자동스캔→**셔터 버튼**(원형·하단)·뷰파인더 **정사각 1:1**·셔터=즉시 정사각 촬영→대화창 핸드오프(인식은 대화창) · 상담 LLM에 **스캔 인식결과+식약처 공식 효능·용법·주의를 맥락 주입**(자동 설명)·`GeminiError`→503(CORS 누락 500 오인 해소)·면책 완화 · **박스 제품명 인식**(자동 감지→이름검색) · 홈 그래프 애니 스플래시 후 시작 · **e약은요 적재 스크립트**(`fetch_drug_info.py`) · **내 기록(내 알약사전) localStorage 영속**(인식 시 자동 저장). 검증 그린(backend ruff·format·mypy(125)·import-linter(5)·pytest(39+) / frontend tsc·lint·build). **남은 일**: DUR 병용금기 적재(키 403 — data.go.kr DUR 활용신청 필요) · 내 기록 마무리(삭제 UI·실상세 링크) · 멀티턴 대화 히스토리(guidance LLM은 메시지별 stateless) · 매칭 인식률 튜닝 · 홈 더미→실데이터 · 폰 실기기 시연. 재배포 시 §8 필독.
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
  - DB: **공유 Neon Postgres** — `pills` **27,330건**(낱알식별 25,315 + e약은요 전용 신규 2,015), 효능·용법·주의 채워짐 4,770건. `conversations`·`messages` 준비됨.
  - **Gemini = 유료 키** (Railway `GOOGLE_API_KEY`). 무료 키였을 때 일일 쿼터(20/day) 소진으로 상담이 503→프론트 '서버 연결 불가'로 보이던 이슈 해소.
- **인식 흐름**: 카메라 셔터 누르면 정사각 1장 촬영 → `/chat` 이동 → 대화창에서 `identifyPill`(비전) → 상위 후보의 식약처 공식 효능·용법·주의를 맥락에 담아 LLM이 자동 설명. 포장 박스는 제품명 OCR→이름검색으로 자동 분기.
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

1. **DUR 병용금기 적재 (막힘)** — 같은 `DATA_GO_KR_KEY`로 DUR(`DURPrdlstInfoService03`) 호출이 **403 Forbidden**. data.go.kr은 API별 활용신청이 따로라 키가 DUR에 미신청 상태. **data.go.kr 로그인 → "의약품 안전사용서비스(DUR) 품목정보" 활용신청**(자동승인) 후 풀림. 그 다음 새 테이블(병용금기 쌍) 설계·적재 + 상담 경고 연동. (외부 계정 작업이라 AI가 못 함)
2. **매칭 인식률 튜닝** — 각인 없는 흐릿한 사진은 모양+색만으론 변별 0(동점 다수→`item_seq` tie-break로 임의 1위). `pill_repository._score`·`identify.py`의 `_MIN_SCORE`·`VISION_PROMPT`. 자신 없으면 재촬영 유도하는 게이트도 검토.
3. **멀티턴 대화 히스토리** — guidance LLM은 메시지별 `system_prompt + 현재 메시지`만 받아 **이전 대화를 기억 못 함**(`ask_guidance.execute` → `llm.ask`에 history 미전달). 스캔 맥락은 매 질문에 `pill_context`로 동봉해 유지 중. 멀티턴 기억이 필요하면 history를 LLM 호출에 포함하도록 개편.
4. **내 기록 마무리** — ① 카드 **삭제 버튼**(`removeFromCabinet` 구현돼 있음, UI만) ② 기록 클릭 시 더미 `/pill/:id` 대신 **실제 사전 상세 `/dictionary/:itemSeq`**(효능·용법·주의 실데이터) 연결. 작음.
5. **홈 더미 → 실데이터** — 복약률(`HomePage` `ADHERENCE=80`)·'최근 대화'·'약속의 한마디' 전부 더미. 실수치/실요약은 복용 체크 기록 모델 필요(중간~큼).
6. **멀티턴 대화 히스토리** — guidance LLM은 메시지별 `system_prompt + 현재 메시지`만 받아 **이전 대화를 기억 못 함**(`ask_guidance.execute` → `llm.ask`에 history 미전달). 스캔 맥락은 매 질문에 `pill_context`로 동봉해 유지 중. 멀티턴 기억이 필요하면 history를 LLM 호출에 포함하도록 개편.
7. **매칭 인식률 튜닝** — 각인 없는 흐릿한 사진은 모양+색만으론 변별 0(동점 다수→`item_seq` tie-break로 임의 1위). `pill_repository._score`·`identify.py`의 `_MIN_SCORE`·`VISION_PROMPT`. 자신 없으면 재촬영 유도 게이트 검토.
8. **폰 카메라 실기기 시연** — seuk.cloud(HTTPS)라 동작할 것. 헤드리스/데스크톱은 카메라 없어 미검증.

## 5. 더미(연출용) vs 실데이터 — 시연 참고

- **실데이터/실LLM**: 대화(상담), 알약사전 목록·상세·검색(`/all-pills`·`/dictionary/:itemSeq`), 카메라 인식 결과.
- **내 기록(실연결)**: `/cabinet` 내 알약사전이 **localStorage `yaksok:cabinet`에 영속**(`cabinet.loadCabinet`). 카메라로 약을 인식하면 자동 저장돼 쌓인다. 비었을 때 기본 약으로 시드. CabinetPage·'오늘의 약속' 내 사전이 공유. (클릭→상세는 아직 더미 `/pill/:id` — §4-4 후속)
- **더미(연출/스크린샷용)**: 홈 '최근 대화'·복약률 수치(원그래프는 `HomePage` `ADHERENCE` 상수)·'약속의 한마디'. → 화면 채우기용.
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
| `backend/scripts/fetch_pills.py` | 낱알식별 적재(v03, upsert 청크) |
| `backend/scripts/fetch_drug_info.py` | e약은요 적재 — 효능·용법·주의 부분갱신 + 전용품목 신규삽입 |
| `backend/railway.toml` | Railway 배포 설정 |
| `vercel.json` | Vercel 빌드/SPA 설정 |
| `frontend/src/lib/api.ts` | 백엔드 클라이언트(identify·dictionary·guidance) |
| `frontend/src/lib/{storage,cabinet}.ts` | localStorage 건강정보·복약약(`loadMedications`)·내 알약사전 더미 |
| `frontend/src/pages/{camera,chat,allpills,dictionary,cabinet,home,today,profile}/` | 화면들 (`today`=오늘의 약속 편집) |
