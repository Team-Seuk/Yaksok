# Yaksok (약속)

> 소개·실행법·환경변수·API 명세. 의사결정·범위는 PLAN.md.

알약을 카메라로 비추면 **Gemini Vision**이 모양·색·각인을 읽고, 식약처 낱알식별 DB와 대조해 약 정보를 찾아줍니다. **프로미(Promi)** 복약 상담 AI가 건강정보 맞춤 용법·주의사항도 안내합니다.

---

## 빠른 시작

### 1. 저장소 복제

```bash
git clone https://github.com/Team-Seuk/Yaksok.git
cd Yaksok
```

### 2. 환경변수 설정

```bash
# Windows
copy backend\.env.example backend\.env

# mac/Linux
cp backend/.env.example backend/.env
```

`backend/.env`를 열어 아래 값을 채운다 (받은 키는 절대 커밋하지 않는다):

```
GOOGLE_API_KEY=...        # Gemini Vision + LLM
DATA_GO_KR_KEY=...        # 공공데이터 낱알식별 적재용
DATABASE_URL=postgresql+psycopg://...?sslmode=require   # 팀 공유 Neon
```

> **키가 없을 때**: `GOOGLE_API_KEY` 미설정 시 Vision·LLM이 fake 모드로 자동 전환돼 전체 흐름을 테스트할 수 있다.

### 3. 백엔드 실행 (FastAPI · Python 3.12+ · uv)

```bash
cd backend
uv sync                           # 첫 실행 시만 — .venv 생성 + 패키지 설치
uv run uvicorn main:app --reload  # http://localhost:8000
```

> uv 미설치 시: `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"` → 새 터미널

확인: `GET http://localhost:8000/health` → `{"status":"ok"}`  
DB 연결 성공 시 startup 로그에 테이블 자동 생성 메시지가 출력됩니다.

### 4. 프론트엔드 실행 (React 18 · TypeScript · Vite)

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

> 백엔드 주소를 바꾸려면 `frontend/.env`에 `VITE_API_BASE=http://...` 추가 (기본값 `http://localhost:8000`)

---

## 환경변수 전체 목록

### backend/.env

| 변수 | 필수 | 설명 |
|---|---|---|
| `GOOGLE_API_KEY` | 권장 | Gemini Vision + LLM (없으면 fake 모드) |
| `DATABASE_URL` | 권장 | Neon Postgres URL (`postgresql+psycopg://...?sslmode=require`) |
| `DATA_GO_KR_KEY` | 적재 시 | 공공데이터포털 낱알식별 API 키 (pills 테이블 초기 적재용) |
| `ANTHROPIC_API_KEY` | 미사용 | 보존용 (현재 코드에서 사용 안 함) |

`DATABASE_URL` 미설정 시 로컬 PostgreSQL(`postgresql+psycopg://yaksok:yaksok@localhost:5432/yaksok`) 기본값 사용. SQLite 불가 (JSONB 컬럼).

### frontend/.env

| 변수 | 기본값 | 설명 |
|---|---|---|
| `VITE_API_BASE` | `http://localhost:8000` | 백엔드 베이스 URL |

---

## 프로젝트 구조

```
Yaksok/
├── backend/
│   ├── main.py                  # FastAPI 진입점 · 라우터 등록 · lifespan
│   ├── core/
│   │   ├── config.py            # 환경변수(.env) 로드
│   │   ├── db.py                # SQLAlchemy 엔진 · 세션
│   │   └── gemini.py            # Gemini 클라이언트 래퍼
│   ├── apps/
│   │   ├── pill/                # 알약 인식·매칭·사전 도메인
│   │   │   ├── domain/          # 엔티티·값객체 (순수)
│   │   │   ├── app/             # use_cases · ports · dtos
│   │   │   ├── adapter/
│   │   │   │   ├── inbound/api/v1/   # FastAPI 라우터
│   │   │   │   └── outbound/         # DB repo · Gemini Vision
│   │   │   └── dependencies/    # FastAPI DI provider
│   │   └── guidance/            # 복약 상담 도메인 (같은 구조)
│   └── scripts/
│       └── fetch_pills.py       # 공공데이터 → Neon DB 적재 (1회)
└── frontend/
    ├── src/
    │   ├── lib/
    │   │   ├── api.ts           # 백엔드 API 클라이언트
    │   │   ├── pillData.ts      # 알약 더미 데이터 (→ API 교체 예정)
    │   │   └── storage.ts       # 건강정보 localStorage
    │   └── pages/
    │       ├── camera/          # 카메라 촬영·업로드
    │       ├── identify/        # 식별 결과
    │       ├── allpills/        # 알약 사전 목록
    │       ├── result/          # 알약 상세
    │       ├── chat/            # 복약 상담 목록
    │       └── conversation/    # 상담 대화
    └── public/
        └── data/pills.json      # 적재 후 생성 (fetch_pills.py 산출)
```

**아키텍처**: 헥사고날 — `adapter → app → domain` 단방향, features 상호 import 금지, `core`는 features import 금지. 위반 시 CI(`lint-imports`) 실패.

---

## API 명세

서버 기동 후 Swagger UI: `http://localhost:8000/docs`

### GET /health

서버 상태 확인.

**응답** `200`
```json
{ "status": "ok" }
```

---

### POST /api/pill/identify

알약 사진을 업로드하면 Vision이 속성을 추출하고 DB 후보를 반환합니다.

**요청** `multipart/form-data`

| 필드 | 타입 | 설명 |
|---|---|---|
| `file` | 파일 | 알약 사진 1장. jpeg / png / webp, 최대 8MB |

**응답** `200`
```json
{
  "attributes": {
    "shape": "원형",
    "color_front": "하양",
    "color_back": "하양",
    "imprint_front": "AAA",
    "imprint_back": null,
    "line_front": "없음",
    "line_back": null,
    "form": "필름코팅정"
  },
  "candidates": [
    {
      "item_seq": "123456789",
      "item_name": "타이레놀정500밀리그램",
      "entp_name": "한국얀센",
      "shape": "원형",
      "color_front": "하양",
      "color_back": null,
      "print_front": "TYLENOL",
      "print_back": null,
      "image_url": "https://...",
      "is_otc": true,
      "score": 5.0
    }
  ],
  "needs_retry": false,
  "message": null
}
```

- `needs_retry: true`이면 사진 재촬영 필요 (후보 0개 또는 최고 점수 < 2.0)
- `message`: 재촬영 안내 문구 (needs_retry 시)
- 색 표기는 식약처 raw 값 사용 (`"하양"` O / `"흰색"` X)

**오류**

| 코드 | 원인 |
|---|---|
| `400` | 빈 이미지 |
| `413` | 8MB 초과 |
| `415` | 지원하지 않는 형식 |
| `500` | DB 연결 오류 (Neon URL 확인) |

---

### POST /api/guidance/conversations

새 복약 상담 대화방을 생성합니다.

**요청** 본문 없음

**응답** `200`
```json
{
  "id": "uuid-string",
  "created_at": "2026-06-25T00:00:00"
}
```

---

### POST /api/guidance/conversations/{conversation_id}/messages

대화방에 메시지를 보내고 AI 답변을 받습니다.

**경로 파라미터**

| 파라미터 | 설명 |
|---|---|
| `conversation_id` | 대화방 ID (POST /conversations 응답의 `id`) |

**요청** `application/json`
```json
{
  "message": "이 약을 식후에 먹어야 하나요?",
  "health_info": {
    "allergies": ["페니실린"],
    "is_pregnant": false,
    "is_breastfeeding": false,
    "conditions": ["고혈압"],
    "current_medications": ["아스피린"]
  }
}
```

**응답** `200`
```json
{
  "id": "uuid-string",
  "role": "assistant",
  "content": "네, 이 약은 식후 30분에 복용하시는 것이 좋습니다...",
  "created_at": "2026-06-25T00:00:00"
}
```

**오류**: `404` — conversation_id 없음

---

### GET /api/guidance/conversations/{conversation_id}/messages

대화방 메시지 내역을 반환합니다.

**응답** `200` — `MessageResponse` 배열 (위 응답 구조와 동일)

---

## 데이터 초기 적재 (팀원4 담당 · 1회)

```bash
cd backend
uv run python scripts/fetch_pills.py
```

공공데이터포털 낱알식별 API(`DATA_GO_KR_KEY`)에서 데이터를 받아 **공유 Neon DB**의 `pills` 테이블에 적재하고 `frontend/public/data/pills.json`을 생성합니다. 공유 DB라 **1회 실행하면 팀 전원이 실데이터를 공유**합니다.

---

## 검증 명령

```bash
# 백엔드 (backend/ 에서)
uv run ruff check .
uv run ruff format --check .
uv run mypy
uv run lint-imports
uv run pytest

# 프론트엔드 (frontend/ 에서)
npm run build
npm run lint
```

코드 변경 후 위 명령 전부 통과한 뒤 커밋합니다.

---

## 배포 & 도메인 연결 (seuk.cloud)

팀 공개 주소: **`https://seuk.cloud`** (프론트) / **`https://api.seuk.cloud`** (백엔드)

### 1단계 — 프론트엔드: Vercel 배포

1. [vercel.com](https://vercel.com) → **Continue with Google** (팀 구글 계정으로 로그인) → **Add New Project** → GitHub `Team-Seuk/Yaksok` 연결
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`  
   **Output Directory**: `dist`
4. **Environment Variables** 추가:
   ```
   VITE_API_BASE = https://api.seuk.cloud
   ```
5. Deploy 클릭 → 배포 완료 후 Vercel 도메인 확인 (`xxx.vercel.app`)

### 2단계 — 백엔드: Railway 배포

1. [railway.app](https://railway.app) → **New Project** → Deploy from GitHub → `Team-Seuk/Yaksok`
2. 레포 루트에 `railway.toml`이 있으므로 설정 자동 인식
3. **Variables** 탭에서 환경변수 추가:
   ```
   GOOGLE_API_KEY = ...
   DATABASE_URL   = postgresql+psycopg://...?sslmode=require
   DATA_GO_KR_KEY = ...
   ```
4. **Settings → Networking → Generate Domain** → 커스텀 도메인 `api.seuk.cloud` 추가
5. Railway가 표시하는 CNAME 값을 복사해 둔다

### 3단계 — 가비아 DNS 설정

[gabia.com](https://gabia.com) → 도메인 관리 → `seuk.cloud` → **DNS 관리** → 레코드 추가:

| 타입 | 호스트 | 값 | TTL |
|---|---|---|---|
| `CNAME` | `@` (루트) | Vercel 제공 CNAME (`cname.vercel-dns.com`) | 300 |
| `CNAME` | `www` | Vercel 제공 CNAME | 300 |
| `CNAME` | `api` | Railway 제공 CNAME | 300 |

> 루트 도메인(`@`)이 CNAME을 지원하지 않는 경우 → Vercel에서 `www.seuk.cloud`를 기본으로 쓰고 `@`는 `A` 레코드(Vercel IP)로 설정하거나 가비아의 URL 포워딩을 사용한다.

### 4단계 — Vercel 커스텀 도메인 등록

Vercel 프로젝트 → **Settings → Domains** → `seuk.cloud` 및 `www.seuk.cloud` 추가 → DNS 전파 확인 (최대 48시간, 보통 수분 내)

### 5단계 — 확인

```
https://seuk.cloud              → 프론트 앱 로딩
https://api.seuk.cloud/health   → {"status":"ok"}
```

---

🧑‍💻 **Git이 처음이라면 [CONTRIBUTING.md](CONTRIBUTING.md)를 먼저 읽으세요.**
