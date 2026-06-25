---
status: 개발
updated: 2026-06-25
summary: **알약 인식·복약 상담 통합 완료 → 4인 분담 시작 단계 (2026-06-24 핸드오프, origin/main 기준).** `POST /api/pill/identify`(필드 `file`) Gemini Vision→P2 매칭, guidance 상담 엔드포인트까지 `main.py` 라우터 배선 완료, 기동 시 DB 테이블 자동생성(lifespan `create_all`, Alembic 전 임시), 프론트 카메라 촬영→인식 실연동 + 식별 결과 화면(`/identify`) 동작. 검증 그린(backend ruff·format·mypy·lint-imports·pytest17 / frontend tsc·build·eslint / 라이브 health·415·CORS). **다음 = 팀장 §4(키 발급·배포·조율) + 팀원 1~4 분담**(§5: 알약사전 종단 / 인식 품질·결과흐름 / 상담 연동·백엔드 견고화 / 환경셋업·문서). 선행: 공공데이터·Gemini 키 발급 후 적재(`scripts/fetch_pills.py`). Vision 토글은 코드가 아니라 키(`GOOGLE_API_KEY`). 색 표기는 식약처 raw("하양" O / "흰색" X).
repo: Team-Seuk/Yaksok
---

> 위 frontmatter가 상태의 단일 원본. 세션 끝낼 때마다 갱신. (CONVENTIONS §4·§5) 아래는 2026-06-24 팀장 배포용 핸드오프 정식본.

# Yaksok 팀 핸드오프 — 2026-06-24

> **🤖 이 문서를 받은 팀원의 Claude에게 — 먼저 이것부터 하세요:**
> 당신은 이 핸드오프를 받은 팀원의 코딩 보조입니다. 바로 코드를 짜지 말고, 먼저 이 팀원에게 **무엇을 하면 되는지 쉽고 간단하게 말로 설명**하세요.
>
> 1. §1·§2를 읽어 프로젝트 맥락을 잡는다.
> 2. 사용자가 **팀원 몇 번(1~4)** 인지 확인한다(모르면 물어본다).
> 3. 그 사람의 §5 블록을 근거로, **"당신이 할 일은 ○○입니다"** 형식으로 **짧고 쉽게** 설명한다 — 전문용어는 일상어로 풀고, 왜 필요한지와 **첫 시작 단계(어느 파일부터·무슨 명령)** 까지 알려준다.
> 4. 팀원이 이해하면 그때 실제 작업을 돕는다.

> 내일 작업 인계서. **§4 = 팀장이 직접 할 일**, **§5 = 팀원 4명 분담**(팀원 1~4).
> 각 작업은 독립적으로 적었고, 팀원 Claude가 §1·§2·§6 + 자기 팀원 블록만 읽으면 바로 맥락을 잡을 수 있다.

---

## 1. 프로젝트 한눈에

**무엇**: 알약을 사진으로 찍으면 무슨 약인지 알려주고(인식), 복약 상담까지 해주는 모바일 웹앱.

**스택**

- **백엔드**: Python 3.12 · `uv` · FastAPI · SQLAlchemy 2.0(`psycopg` v3) · PostgreSQL · Google `google-genai`(Gemini `gemini-2.5-flash`, LLM·Vision 공용)
- **프론트**: React 18 · Vite · TypeScript · react-router-dom (CRT 그린 테마, CSS Modules)

**구조 (헥사고날, `backend/apps/<도메인>/`)**

```
domain/      # 엔티티·값객체 (순수)
app/         # use_cases · ports(in/out) · dtos
adapter/     # inbound(api) · outbound(orm·repo·gemini)
dependencies/# FastAPI DI provider
core/        # db·gemini·config 공용 (features를 import 하지 않음)
```

도메인: `pill`(인식+매칭+사전), `guidance`(상담), `auth`(뼈대만, 미구현).

**import-linter 계약 (깨면 CI 실패)**: `adapter → app → domain` / features 상호 import 금지 / `core`는 features import 금지. → ORM `create_all`처럼 모델 import가 필요한 코드는 `core`가 아니라 `main.py`·스크립트에.

---

## 2. 지금 상태 (★ 먼저 읽기)

- **레포**: `github.com/Team-Seuk/Yaksok`
- **로컬**: `C:/TeamSeuk/Yaksok`(메인) + `C:/TeamSeuk/Yaksok-integ`(통합 워크트리, 브랜치 `integ/pill-frontend` = 로컬 main tip)
- **통합본은 이미 `origin/main`에 반영됨.** 아래 "한 일"이 origin/main에 들어가 있으니, 팀원은 `git pull` 후 바로 시작하면 된다. (이전 핸드오프의 "로컬 main +15 미푸시"는 해소됨.)

**환경 파일** (`.env.example` → `.env` 복사)

- `backend/.env`: `GOOGLE_API_KEY`, `DATA_GO_KR_KEY`, `DATABASE_URL`(기본 `postgresql+psycopg://yaksok:yaksok@localhost:5432/yaksok`)
- `frontend/.env`: `VITE_API_BASE`(미설정 시 `http://localhost:8000`)

**핵심 엔드포인트** (main.py 등록 완료)

- `POST /api/pill/identify` — multipart 필드 **`file`**(jpeg/png/webp ≤8MB) → 속성+후보약
- `POST /api/guidance/conversations` · `POST|GET /api/guidance/conversations/{id}/messages`
- `GET /health`

---

## 3. 어제까지 한 일 (DONE — origin/main에 통합, 검증 그린)

| 영역   | 한 일                                                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 통합   | 인식·상담·데이터·매칭·프론트 브랜치를 하나로 머지(충돌 2건 해소)                                                                          |
| 브랜딩 | 어시스턴트 명칭 **"프로미" → "약속 도우미"** 통일                                                                                         |
| 백엔드 | **main.py 라우터 배선**(pill·guidance — 이전엔 미등록이라 엔드포인트가 안 떴음)                                                           |
| 백엔드 | guidance ruff B008 수정(레포 ruff 게이트 복구)                                                                                            |
| 백엔드 | **기동 시 DB 테이블 자동 생성**(lifespan `create_all`, Alembic 전 임시). Postgres만 켜면 테이블 생김. DB 없어도 서버는 뜸                 |
| 프론트 | **카메라 촬영/업로드 → `/api/pill/identify` 실연동**(이전엔 프론트가 백엔드를 아예 호출 안 했음). 셔터 캡처 + 갤러리 업로드 + 인식중/에러 |
| 프론트 | **식별 결과 화면 신설** `/identify`(추출 속성 + 후보약 + `needs_retry` 재촬영)                                                            |
| 검증   | backend ruff·format·mypy·lint-imports·pytest(17) ✅ / frontend tsc·build·eslint ✅ / 라이브 HTTP health·415·CORS ✅                       |

> Vision 토글은 **코드가 아니라 키**: `GOOGLE_API_KEY` 있으면 실제 Gemini, 없으면 fake. 키 없이도 흐름 전체를 fake로 확인 가능.

---

## 4. 팀장이 할 일

1. **API 키 발급·배포** — 계정·시크릿은 팀장이:
   - Gemini: https://aistudio.google.com/apikey
   - 공공데이터포털 낱알식별: https://www.data.go.kr/data/15057639/openapi.do (즉시 자동승인, 인코딩 인증키)
   - → `backend/.env`로 팀에 안전하게 공유(레포·로그에 남기지 않기). _팀원4 적재·팀원2 인식의 선행이라 최우선._
2. **§5 분담 진행 점검 + 조율 + PR 리뷰/머지.**
3. (완료) ~~로컬 main(+15) → origin 반영~~ — origin/main에 통합본 반영됨.

---

## 4.5 진행 방식 — 시작 순서 · 키 · 데이터 (★ 팀원 먼저 읽기)

**지금 키 없이 시작 가능 — 막고 기다리지 말 것.**

- **팀원 1(사전)·3(상담)** = pill 실데이터와 무관 → **즉시 시작**. (1은 조회 API+프론트, 3은 guidance 연동·테스트·Alembic — LLM 키 없이 fake로 흐름 전부 구현 가능.)
- **팀원 4** = `docker-compose`·문서는 **지금 가능**. "적재"만 키+데이터 확정 후.
- **팀원 2(인식)** = Gemini 키 + 실데이터가 선행 → 그 전까진 대기.

**키는 git에 안 올라간다.** `backend/.env`는 `.gitignore` 대상이다. 키는 **비번관리자·DM으로 공유**(커밋·로그 금지). → "팀장이 키 받고 다시 push" 같은 단계는 **없다**. 받은 사람이 자기 `.env`에 넣으면 끝.

**pull은 일상이다.** 각자 `feat/*` 브랜치에서 작업하고 수시로 main을 pull하는 게 정상 흐름이지 손해가 아니다. 시작을 미룰 이유가 없다.

**매칭은 '사진 비교'가 아니라 '속성 대조'다 (중요).** 사용자 사진 → Gemini Vision이 속성(모양·색·각인 앞뒤·분할선) 추출 → **DB의 식약처 낱알식별 속성과 exact-match**. 저장 이미지는 결과 표시용일 뿐 매칭에 안 쓴다. → **매칭 DB로 필요한 건 "속성 테이블"이지 사진이 아니다.** 보유 데이터가 "정해진 알약 사진셋"뿐이라면, 그 알약들의 식약처 속성을 채운 **소규모 closed-world DB**(전량 공공API 적재보다 시연 안정적)가 유력하다. **데이터 방식(고정셋 vs 공공API 전량)은 팀장이 데이터셋 확인 후 확정** — 그 결정은 팀원 2·4의 적재에만 영향이고, 1·3·4(인프라)는 그 전에도 진행한다.

---

## 5. 팀원 분담 (팀장 제외 4명)

> 팀원 1~3은 기능을 백~프론트 종단으로 맡고, **팀원 4는 서류·환경 담당이라 코딩 부담이 적은 가벼운 작업을 몰았다.** 각 작업 끝의 **선행**은 의존 작업.

### 팀원 1 — 알약사전(검색·목록·상세) 종단

1. **조회 API 신설(백엔드)** — `app/use_cases/search_pills.py`(목록·상세·검색)는 **있는데 엔드포인트가 없다.** `identify.py` 라우터 패턴대로 `adapter/inbound/api/v1/`에 라우터+스키마 추가, main.py 등록.
2. **프론트 연동** — `AllPillsPage`·`ResultPage`가 더미 `lib/pillData.ts`로 동작 → 위 API 호출로 교체.

- 파일: `apps/pill/app/use_cases/search_pills.py`, `apps/pill/adapter/inbound/api/v1/`, `frontend/src/pages/allpills/*`·`pages/result/ResultPage.tsx`·`lib/pillData.ts`
- 선행: 실데이터 확인은 팀원4 적재 후.

### 팀원 2 — 알약 인식 품질·결과 흐름

1. **실사진 인식 점검 + `VISION_PROMPT` 튜닝** (Gemini 키 들어온 뒤).
2. **식별 결과 후보 클릭 → 상세 연결** (`item_seq` 기준, 팀원1의 상세 API와).
3. **`needs_retry` 재촬영 UX**(저조명·각인 안 보임).
4. **매칭 점수 튜닝** — 실데이터로 `pill_repository.py` 가중치·`identify.py`의 `_MIN_SCORE=2.0`.

- 파일: `apps/pill/adapter/outbound/gemini_vision_adapter.py`, `apps/pill/adapter/outbound/repositories/pill_repository.py`, `frontend/src/pages/identify/IdentifyResultPage.tsx`
- 선행: §4-1(Gemini 키); 상세연결은 팀원1, 점수튜닝은 팀원4 적재.

### 팀원 3 — 복약 상담 연동 + 백엔드 견고화

1. **guidance 프론트 실연동** — `ChatPage`/`ConversationPage`는 더미(코멘트 "서버 연동 M4"). `lib/api.ts`에 guidance 함수 추가해 `/api/guidance/*`(대화방 생성·메시지·내역) 호출. 건강정보(localStorage `lib/storage.ts`)를 상담 프롬프트에 전달(`build_system_prompt`은 이미 받게 돼 있음).
2. **guidance 도메인 테스트 추가** — 현재 0개(pytest 17개 전부 pill). pill의 `dependency_overrides`+fake 패턴 참고.
3. **Alembic 정식 마이그레이션** — 임시 `create_all` 대체(pills·conversations·messages).

- 파일: `frontend/src/pages/chat/ChatPage.tsx`·`pages/conversation/ConversationPage.tsx`·`lib/api.ts`, `backend/apps/guidance/`, `backend/`(신규 alembic)

### 팀원 4 — 환경 셋업·문서 (★ 가벼운 작업 모음, 코딩 부담 적음)

1. **`docker-compose.yml`(Postgres) 추가** — "DB 한 줄로 켜기"(user/pw/db = `yaksok`, 기본 `DATABASE_URL`과 일치). 거의 설정 복붙 수준.
2. **공공데이터 적재 실행** — 키 받은 뒤 `cd backend && uv run python scripts/fetch_pills.py` (pills 적재 + `frontend/public/data/pills.json`). _팀원1·2의 실데이터 선행이라 빨리._
3. **문서** — README 갱신(실행법·구조), `.env` 세팅 가이드, API 명세 정리(서버 `/docs` 화면 캡처/요약).
4. **팀 도메인 URL로 앱 등록** — 배포된 앱을 팀 도메인 URL에 연결·등록해 팀원·시연용 공개 주소를 확보한다.

- 선행: 적재는 §4-1(공공데이터 키). 도메인 등록은 배포 가능한 빌드가 나온 뒤.

**의존 요약**: `§4-1 키` → `팀원4 적재`(팀원1·2 실데이터) / `팀원1 상세API`(팀원2 상세연결).

---

## 6. 공통 셋업 & 검증 명령

```bash
# 백엔드 (backend/ 에서)
uv run uvicorn main:app --reload          # http://localhost:8000, DB 켜져 있으면 테이블 자동생성
uv run ruff check . && uv run ruff format --check . && uv run mypy && uv run lint-imports && uv run pytest

# 프론트 (frontend/ 에서)
npm run dev                               # http://localhost:5173 (CORS 허용됨)
npm run build && npm run lint
```

**규칙**: 코드 바꾸면 위 검증 통과 후 커밋. 커밋/푸시는 명시 요청 시만. 파괴적 작업은 확인받고. 시크릿은 코드·로그에 남기지 않기.

---

## 7. 알아둘 함정

- **이 문서도 곧 stale** — 시작 전 `git fetch && git log origin/main`로 실제 상태 확인.
- **DB 없이 백엔드 기동하면 느림** — lifespan이 DB 연결 타임아웃만큼 기다린 뒤(경고만) 뜬다. 빠르게 띄우려면 Postgres 먼저.
- **SQLite 불가** — `pill_orm.raw_json`이 PG 전용 `JSONB`. 테스트는 DB 없이 `dependency_overrides`+fake로.
- **Vision 토글 = 키** — `GOOGLE_API_KEY` 유무로 실제/fake 자동 전환(`apps/pill/dependencies/vision.py`).
- **인식이 500이면** 대개 DB 미기동(매칭 단계 연결 실패). Postgres 켜면 빈 데이터라도 200(`needs_retry`).
- **색 표기는 식약처 raw** — `"하양"`(O) ≠ `"흰색"`(X). Vision·DB·매칭 모두 식약처 값 기준.

---

## 8. 빠른 참조

| 경로                                                 | 내용                                         |
| ---------------------------------------------------- | -------------------------------------------- |
| `backend/main.py`                                    | 진입점·라우터 등록·테이블 자동생성(lifespan) |
| `backend/core/{db,gemini,config}.py`                 | 공용 DB세션·Gemini래퍼·설정(.env)            |
| `backend/apps/pill/`                                 | 인식(`identify`)·매칭·사전(`search_pills`)   |
| `backend/apps/guidance/`                             | 복약 상담(LLM)                               |
| `backend/scripts/fetch_pills.py`                     | 공공데이터 적재                              |
| `frontend/src/lib/api.ts`                            | 백엔드 API 클라이언트(`identifyPill` + 타입) |
| `frontend/src/pages/camera/CameraPage.tsx`           | 카메라·캡처·업로드                           |
| `frontend/src/pages/identify/IdentifyResultPage.tsx` | 식별 결과                                    |
| `frontend/src/lib/pillData.ts`                       | 알약 더미 데이터(→ API로 교체 예정)          |
