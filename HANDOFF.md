---
status: 개발
updated: 2026-06-25
summary: **통합 완료 — 팀원 1·2·3·4 작업 전부 main 머지 + 실데이터 적재 + 실 e2e 동작 (2026-06-25).** 알약사전 조회 API(팀원1)·카메라 자동스캔→대화 연결(팀원2)·복약 상담 실연동+Alembic+테스트(팀원3)·배포설정/문서(팀원4)를 main으로 통합(충돌 해소, 프로미 명칭 유지). 검증 그린: backend ruff·format·mypy(124)·import-linter(5 KEPT)·pytest(31) / frontend tsc·lint·build. **공유 Neon Postgres에 낱알식별 25,315건 적재 완료**, 실 e2e 확인(데모 사진 → Gemini Vision 속성추출 → 25k 매칭 → 후보 약 10건, `needs_retry:false`). **남은 일**: ①Railway/Vercel·seuk.cloud 배포 검증 ②Alembic 설정 수정(현재 환경에서 미작동 — 팀원3) ③매칭 상위정렬 튜닝(팀원2). Vision 토글=키(`GOOGLE_API_KEY`), 색은 식약처 raw("하양").
repo: Team-Seuk/Yaksok
---

> 위 frontmatter가 상태의 단일 원본. 세션 끝낼 때마다 갱신. (CONVENTIONS §4·§5)

# Yaksok — HANDOFF (통합 완료, 2026-06-25)

> 4인 분담 → 전부 main 통합 완료. 아래는 **현재 상태 + 남은 후속**. (분담 배포용 메모는 역할을 다함.)

## 1. 프로젝트 한눈에

**무엇**: 알약을 사진으로 찍으면 무슨 약인지 알려주고(인식), 복약 상담까지 해주는 모바일 웹앱.

**스택**: 백엔드 Python 3.12·uv·FastAPI·SQLAlchemy 2.0(psycopg v3)·**공유 Neon Postgres**·Google `google-genai`(Gemini `gemini-2.5-flash`, LLM·Vision 공용). 프론트 React 18·Vite·TS·react-router-dom(CRT 그린, CSS Modules).

**구조(헥사고날 `backend/apps/<도메인>/`)**: `domain`(엔티티·값객체) → `app`(use_cases·ports·dtos) → `adapter`(inbound api / outbound orm·repo·gemini), `dependencies`(DI), `core`(db·gemini·config). import-linter 계약: `adapter→app→domain` / features 상호 import 금지 / core는 features import 금지(5 KEPT).

## 2. 지금 상태 (★ 먼저 읽기)

- **레포**: `github.com/Team-Seuk/Yaksok`, 로컬 `C:/TeamSeuk/Yaksok`.
- **origin/main = 통합 완료본**. 팀원 1·2·3·4 작업 전부 머지됨. `git pull` 후 바로 동작.
- **DB = 공유 Neon Postgres** — `pills` 25,315건 적재됨, `conversations`·`messages` 준비됨.
- **환경 파일**(`.env.example`→`.env` 복사): `backend/.env`에 `GOOGLE_API_KEY`·`DATA_GO_KR_KEY`·`DATABASE_URL`(공유 Neon, 팀장이 DM 배포·커밋 금지). `frontend/.env`는 `VITE_API_BASE`(선택).

**핵심 엔드포인트**

- `POST /api/pill/identify` (필드 `file`) — 사진 → 속성 + 후보 약 + `needs_retry`
- `GET /api/pill/dictionary` (목록·검색) · `GET /api/pill/dictionary/{item_seq}` (상세) — 팀원1
- `POST /api/guidance/conversations` · `POST|GET .../conversations/{id}/messages` — 팀원3
- `GET /health`

## 3. 통합 완료 내역 (DONE)

| 영역 | 한 일 |
| --- | --- |
| 팀원1 | 알약사전 조회 API(`dictionary.py` 라우터·`SearchPillsUseCase`) + 프론트(`PillDetailPage`·`AllPillsPage` API연동) + 테스트 |
| 팀원2 | 카메라 **자동 스캔 루프 → Gemini Vision 인식 → `/chat` 대화 연결**(스캔 결과를 대화 첫 메시지로) |
| 팀원3 | 복약 상담 실연동(`/api/guidance/*`, 건강정보 전달) + **Alembic 도입** + `connect_timeout` + guidance 테스트 10 |
| 팀원4 | README 전면 갱신 + 배포 설정(`railway.toml`·`vercel.json`) + `seuk.cloud` CORS |
| 통합(팀장) | 3브랜치 머지·충돌 해소(`api.ts`·`ChatPage`=스캔+상담 결합·`CameraPage`), 프로미 명칭 유지, 낱알식별 API v01→**v03** 수정, **Neon 적재 25,315건**, 실 e2e 확인 |
| 검증 | backend ruff·format·mypy(124)·lint-imports(5 KEPT)·pytest(31) ✅ / frontend tsc·lint·build ✅ / 실 e2e(사진→후보10건) ✅ |

> 매칭 동작 예: 데모(타이레놀 500, 장방형·하양·각인500) → 후보 상위에 장방형·하양·500 약들 + 아세트아미노펜 성분약 잡힘.

## 4. 남은 일 (후속)

1. **배포 검증 (팀장/팀원4)** — `railway.toml`(백엔드)·`vercel.json`(프론트)·`seuk.cloud` 도메인이 실제로 뜨는지 확인. 배포 환경의 `DATABASE_URL`·`GOOGLE_API_KEY` 설정 필요. ⚠️ 아래 Alembic 이슈가 배포 테이블 생성에 영향.
2. **Alembic 설정 수정 (팀원3)** — 현재 환경에서 alembic이 **작동 안 함**: ①머지 후 `uv sync`로도 `alembic` 실행파일 미설치(의존성 그룹 확인), ②로컬 `backend/alembic/` 디렉터리가 설치된 `alembic` 패키지를 **이름충돌로 가림** → `main.py` lifespan의 `alembic upgrade head`가 실패(경고 후 넘어감). **현재 스키마는 `create_all`로 생성해 둠**(정상 동작 중)이나, 배포에서 테이블 자동생성이 안 될 수 있으니 정리 필요. (예: 마이그레이션 디렉터리명을 `migrations`로 바꾸거나 실행 경로 정리.)
3. **매칭 상위정렬 튜닝 (팀원2)** — 실데이터로 `pill_repository._score` 가중치·`identify.py` `_MIN_SCORE`. 데모 약이 후보엔 들지만 1위는 아님(각인/색 표기 편차). 실사진 인식 점검 + `VISION_PROMPT` 튜닝.
4. **(참고)** 적재는 `backend/scripts/fetch_pills.py`로 재실행 가능(upsert, 멱등). 산출물 `frontend/public/data/pills.json`은 gitignore(미사용·재생성 가능).

## 5. 공통 셋업 & 검증

```bash
# 백엔드 (backend/)
uv sync
uv run uvicorn main:app --reload          # http://localhost:8000, .env의 DATABASE_URL(Neon) 필요
uv run ruff check . && uv run ruff format --check . && uv run python -m mypy && uv run python -m pytest
#   ※ lint-imports: uv run python -c "from importlinter.cli import lint_imports; import sys; sys.exit(lint_imports())"
# 프론트 (frontend/)
npm run dev                               # http://localhost:5173 (CORS 허용됨)
npm run build && npm run lint
```

**규칙**: 코드 바꾸면 위 검증 통과 후 커밋. 커밋/푸시는 명시 요청 시만. 시크릿은 코드·로그에 남기지 않기.

## 6. 알아둘 함정

- **DB = 공유 Neon** — `DATABASE_URL` 없으면 쿼리 실패. Neon 서버리스는 유휴 후 콜드스타트(~5-10s) → `connect_timeout` 15s로 여유(첫 요청 한 번은 느릴 수 있음).
- **SQLite 불가** — `pill_orm.raw_json`이 PG 전용 JSONB. 테스트는 DB 없이 `dependency_overrides`+fake로(현 pytest 31건 DB 불필요).
- **Vision 토글 = 키** — `GOOGLE_API_KEY` 유무로 실제/fake 자동 전환(`apps/pill/dependencies/`).
- **색 표기는 식약처 raw** — `"하양"`(O) ≠ `"흰색"`(X). Vision·DB·매칭 모두 식약처 값 기준.
- **공공데이터 낱알식별 API = v03** — 구 `MdcinGrnIdntfcInfoService01`은 폐기(500). 현행 `...Service03/getMdcinGrnIdntfcInfoList03`.
- **Alembic 현재 미작동** — §4-2 참조. 스키마는 `create_all`로 만들어져 있음.

## 7. 빠른 참조

| 경로 | 내용 |
| --- | --- |
| `backend/main.py` | 진입점·라우터 등록·lifespan(alembic, 현재 미작동) |
| `backend/core/{db,gemini,config}.py` | DB세션·Gemini래퍼·설정 |
| `backend/apps/pill/` | 인식(`identify`)·매칭(`pill_repository`)·사전(`dictionary`·`search_pills`) |
| `backend/apps/guidance/` | 복약 상담(LLM) + fake 어댑터·테스트 |
| `backend/scripts/fetch_pills.py` | 공공데이터 적재(v03, upsert) |
| `frontend/src/lib/api.ts` | 백엔드 클라이언트(identify·dictionary·guidance) |
| `frontend/src/pages/{camera,chat,allpills,dictionary}/` | 카메라 자동스캔·대화·사전목록·사전상세 |
