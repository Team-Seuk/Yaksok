# Yaksok — LOG

> 날짜별 굵직한 변경 한 줄. 세세한 커밋은 git log. (CONVENTIONS §3)

## 2026-06-26
- **카메라 인식 UX 개편** (PR #28·#30·#31·#32·#33·#36): 자동스캔(들고 기다리면 인식)→**셔터 버튼**(안드로이드식 민트 링+흰 코어 원형, 하단 컨트롤 바)·**뷰파인더 정사각 1:1**(모바일에서 `max-height`로 찌그러지던 것 해소·팁 카드 제거로 세로 확보)·캡션 두 줄→한 줄·셔터=**그 순간 정사각 center-crop 1장**만 찍어 곧바로 `/chat` 핸드오프(인식·대기 표시 없음), 비전 인식은 대화창에서 수행.
- **상담 LLM 맥락·안정화** (PR #27·#29·#35·#40): `GeminiError`를 **503**로 변환(미처리 500이 CORS 헤더 없이 나가 '서버 연결 불가'로 오인되던 것 해소)·면책 문구 완화(매 답변 강제→안전 직결 시 한 줄)·스캔 인식 결과를 **`pill_context`로 시스템 프롬프트에 주입**(스캔 직후 LLM이 약·용법을 자동 설명, 이후 질문도 맥락 유지)·상위 후보의 **식약처 공식 효능·용법·주의를 맥락에 넣어** LLM이 자체 지식 대신 데이터 근거로 답하게 함.
- **박스(포장) 제품명 인식** (PR #34): 자동 감지 — Vision이 포장에 인쇄된 `product_name`을 읽으면 물리속성 매칭 대신 **이름검색**(`search_candidates`, 정확>접두>포함 점수)으로 분기, 맨 알약이면 기존 속성매칭.
- **홈 그래프 애니메이션 타이밍** (PR #37): 복약률 원그래프 차오름이 첫 접속 시 스플래시 뒤에서 끝나버리던 것 → `SplashReadyContext`로 스플래시 종료(=홈 보임) 시점에 시작.
- **데이터 보강 — e약은요 적재** (PR #39·#41): `scripts/fetch_drug_info.py` — 의약품개요정보(DrbEasyDrugInfoService)에서 효능·용법·주의(+경고·상호작용·이상반응 합본)를 받아 **매칭 기존 행 부분 갱신 + e약은요 전용 품목 신규 삽입**(액제·크림 등, 물리속성 없이 사전 검색용). 공유 Neon: 총 행 **25,315→27,330**, efcy 채워짐 **0→4,770**.
- **내 기록(내 알약사전) 영속** (PR #43): 하드코딩 더미 → **localStorage(`yaksok:cabinet`)** 영속(`cabinet.ts` `loadCabinet`/`addToCabinet`/`removeFromCabinet`/`lookFrom`, 기본 약 시드). **카메라 인식 시 상위 후보를 내 기록에 자동 저장**(중복은 최신으로, 최대 50) → '그동안 알아본 약'이 실제로 쌓이고 새로고침에도 유지. CabinetPage·'오늘의 약속' 내 사전이 같은 저장소를 읽음. (계정·id 없는 1인용 모델 = 건강정보·복약약과 동일)
- **운영**: Gemini **유료 키로 교체**(라이브 무료 쿼터 20/day 소진 해소). DUR 병용금기는 키가 DUR API에 미신청(403)이라 보류 — data.go.kr 활용신청 후 진행.

## 2026-06-25
- **HANDOFF §4 후속 3건 (PR #23·#24)**: ①`core/db.py`/`config.py` — DATABASE_URL `postgresql://`·`postgres://`를 `postgresql+psycopg://`로 자동 정규화(field_validator). ②**Alembic 활성화** — 의존성 추가 + `backend/alembic/`→`backend/migrations/`(로컬 디렉터리가 설치 패키지명을 가리던 문제 해소), lifespan `upgrade head` 작동. ③**매칭 점수화 보정** — 각인을 1차 OR 필터에 포함(강식별자 누락 방지)·각인 가중치 3.0→5.0·동점 `item_seq` tie-break.
- **'오늘의 약속' 편집 + 홈 그래프 + 인트로 + 호칭 개인화 (PR #25)**: 홈 '오늘의 약속' 카드 → 전체화면 편집(**View Transition 카드 모핑**, 복용 시점/타이밍/횟수/용량 인라인 수정·삭제·추가[직접 입력·내 사전·전체 사전 검색], 탭바 유지)·홈 **복약률 원그래프**(진입마다 0→수치 카운트업)·인트로 개편(건너뛰기 제거·2초 고정·캡슐 두 반쪽이 모여 붙는 연출·텍스트 조기 등장)·전역 텍스트 선택/이미지 드래그 방지·복약 상담 프롬프트의 **'어르신' 단정 제거 → 나이·성별 기반 호칭**(나이/성별/병력을 백엔드로 전달). 검증 그린(backend ruff·format·mypy 124·pytest 31·import-linter 5 / frontend tsc·lint·build).
- **4인 분담 통합 + 라이브 배포**: 팀원 1(알약사전 조회 API+프론트)·2(카메라 자동스캔→대화)·3(상담 실연동+Alembic+테스트)·4(배포설정·README) 브랜치를 main 통합(충돌해소: `api.ts`/`ChatPage`=스캔+상담 결합/`CameraPage`, 프로미 명칭 유지). 검증 그린(backend ruff·format·mypy 124·lint-imports 5·pytest **31** / frontend tsc·lint·build).
- **공공데이터 적재**: 낱알식별 API **v01(500 폐기)→v03** 수정, 공유 **Neon**에 **25,315건** 적재. `upsert_many` 버그 2개 수정 — 단일 INSERT 파라미터 한계(65535) → **1000행 청크**, `item_seq` 중복 → **dict 중복제거**. 실 e2e(사진→Vision→매칭→후보) 확인.
- **배포(라이브)**: 프론트 **Vercel = www.seuk.cloud**, 백엔드 **Railway = yaksok-production-9631.up.railway.app**, DB Neon. 배포 함정 4개 해결 — railway.toml을 `backend/`로(Root Directory=backend), `NIXPACKS_UV_VERSION=0.11.23`, `DATABASE_URL`에 `+psycopg`(psycopg v3), Vercel `VITE_API_BASE`. **배포본에서 상담(실 LLM)·사전 검증됨.** 상세·재배포 가이드는 [HANDOFF.md](HANDOFF.md) §8.
- 남은 후속: 폰 카메라 실기기 시연 · `core/db.py` URL 정규화(선택) · Alembic 설정(팀원3, 의존성 누락+디렉터리 충돌) · 매칭 정렬 튜닝(팀원2).

## 2026-06-24
- **P3↔P2 매칭 통합** (`feat/pill-identify`): P2(PR #18) main 머지본을 가져와 P3의 임시 매칭 추상(`PillMatchingPort`·자체 `PillCandidate`)을 **P2 실계약으로 교체** — `PillRepositoryPort.filter_candidates(PillAttrs, limit)`. use_case가 Vision `PillAttributes`(enum)→P2 `PillAttrs`(식약처 raw str) 매핑(각인 `imprint→print`, 단일 분할선→`line_front`/`line_back` 분리, 색 "하양"=식약처 raw). DI는 P2 `PillRepository`(`core.db` 세션)+Vision 키 분기, 테스트는 `dependency_overrides`로 fake 주입(DB·키 불필요). 응답을 P2 `PillCandidate` 필드(+`score`)로, `needs_retry`는 가산점수 기준(`_MIN_SCORE=2.0`). 검증 ruff·mypy(104)·lint-imports(5 KEPT)·pytest(17) 그린. line 표기는 실데이터 적재 후 확인 필요.
- **P3 알약 인식 — `apps/pill` 인식 파이프라인** (`feat/pill-identify`, 커밋 `4925ae2` + P1 머지 `2eb249e`): 백엔드 4인 분담 중 P3. `POST /api/pill/identify`(multipart 필드 `file` 1장, jpeg/png/webp ≤8MB, 사진 미저장) → Vision 속성 추출 → 매칭 → 후보 약. **도메인** `PillAttributes` + 식약처 낱알식별 enum(모양·색·분할선·제형). **포트** Vision/매칭(output)·Identify(input) Protocol, use_case `IdentifyPillUseCase`(2포트 생성자 주입). **Gemini Vision 어댑터**: 구조화 JSON 프롬프트(enum 강제)+파서, **P1 공용 래퍼 `core.gemini`를 감싸 실연동**(response_schema 구조화 출력). **DI 키 기반 분기**: `GOOGLE_API_KEY` 있으면 실제 Gemini, 없으면 fake → CI·오프라인 e2e. 매칭은 아직 P2 스텁. 공용구역 미변경(main 라우터 등록 2줄은 P1 몫). 검증: ruff·mypy(96)·lint-imports(5 KEPT)·pytest(11) 그린.

## 2026-06-23
- **프론트 모바일 폴리시 패스** (`claude/elastic-pascal-72aa59`, 미커밋): 13화면 3축(모바일 일관성·인터랙션/모션·가독성·접근성[고령]) 전수 감사 → 18파일. 전역: `viewport-fit=cover`(safe-area 실작동)·입력 16px화(iOS 줌 차단, `--fs-input`)·**`--accent-strong #0a7d6c`(흰 글자 5:1 AA) → 버튼·`.bubbleMe`·`.newCard`**·`--text-faint` 4.37:1. 화면별: 320px 반응형·하드코딩 px 토큰화·터치타깃 44·aria(메시지 `role=article` 등)·chat 타이핑 인디케이터+자동스크롤 억제·필수표시 스크린리더 보강. **스크롤바**: 내부 스크롤 영역의 PC용 화살표 버튼 스크롤바 제거(원인=`scrollbar-width` 미상속+Chrome의 webkit 무시) → webkit 단일체계(폭 12px·버튼없음·autohide), 표준은 Firefox 격리. 정체성·구조 불변. typecheck/lint/build 그린 + 실렌더 단언 통과. 실기기 모바일 검증. 스펙 [docs/FRONTEND-POLISH.md](docs/FRONTEND-POLISH.md). (PR로 main 머지)

## 2026-06-22
- **프론트엔드 대개편 (M1, `feat/design-overhaul`)**: 정체성=라이트·민트·Pretendard **유지·정제**(무드 다정/부드러운/안심, density airy). ①`theme.css` **토큰 시스템 완성** — 간격·타이포·모션·z·반경 토큰 신설, 하드코딩(24/13/11.5px·버튼 그라데이션) 제거, 솔리드 민트 버튼, `prefers-reduced-motion` 전역. ②**`react-router-dom` 도입** — `App.tsx` useState 화면전환 → 라우터(온보딩 가드·라우터 기반 탭바). ③**개별 대화 화면 신설**(`pages/conversation`). ④6화면 비주얼 폴리시(화면별 CSS Module 분리) + 빈/권한거부/로딩 등 상태 화면. ⑤알약 일러스트 시그니처 강화(`PillImage` 음영·각인·분할선, 하위호환). typecheck·lint·build 그린 + 실렌더 검증. 스펙 [docs/FRONTEND-OVERHAUL.md](docs/FRONTEND-OVERHAUL.md). (브랜치, 미머지)
- **프로젝트 리네임 `pill_recognition` → `Yaksok`**: 로컬 폴더·GitHub 레포(`Team-Seuk/Yaksok`)·git remote + 코드/문서 표기 전반 통일(문서 제목·FastAPI title·pyproject·index.html·theme.css·`package`=`yaksok-frontend`·`storage.ts` 키 `yaksok:health`). HANDOFF·LOG의 과거 이력 기록은 보존. (PR #11)
- **승인 게이트 위험도 기반 재편**: 기존 역할별(영역=담당자) → **위험도 기반**. 일반 기능 파일은 오너 미지정(아무 팀원 1명 승인), 위험 공용구역(`core`·의존성·CI·공용 컴포넌트/`api`·설정·문서)만 @suvisdev(PL)+@bestcow(PO) 2명 오너 → 담당자 셀프승인 데드락 제거. 온보딩(세팅·승인 흐름·역할)을 CONTRIBUTING에 통합. (PR #10)
- **PO 전권 부여**: `protect-main` 룰셋 bypass에 Repository admin(=@bestcow) `always` 추가 → PO는 승인·CI 없이 머지·직접 push 가능. (다른 팀원은 게이트 적용 그대로)

## 2026-06-21
- 백엔드 도구 **_template 표준 정렬**: pip→uv(`pyproject.toml`+`uv.lock`), Python 3.11→3.12, ruff 강화(UP·B·SIM)+format-check, mypy·import-linter(피처별 5계약) 추가, CI를 uv 파이프라인으로(+pytest 실행)·스모크 테스트 1개. 옛 `requirements*.txt`/`ruff.toml`/`pytest.ini` 제거, CODEOWNERS 죽은 경로 수정. 구조·프론트·문서 유지. 로컬 검증 그린.
- **CODEOWNERS 역할 기반 재구성**: 기능별→역할별. `/backend/`→@minahdev(BE), `/frontend/`→@cloverky(FE), 위험·설정·문서→@suvisdev(PL/진수택). PO(@bestcow)·SM(@woojeongalex)은 코드오너 제외(일반 리뷰).
- **main 브랜치 보호 ON + CONTRIBUTING 정합**: `main`에 PR 필수·승인1·Require Code Owners·status check(backend/frontend)·force-push·삭제 차단. CONTRIBUTING 승인 규칙을 역할 기반으로 명시(낡은 `bestcow/` org 참조 수정).

## 2026-06-19
- **ERD 다이어그램 관계 라벨 제거**: 선 위 설명 텍스트(건강정보 참고·못 먹는 약 판정 등) 전부 제거 — 까마귀발 마커로 충분히 읽힘. `ERD.svg`·`ERD.png` 재생성. (PR #4)
- **ERD 다이어그램 가독성 개선**: 레이아웃 재배치(성분 매칭 `allergens`를 `allergies` 바로 아래로 → 매칭 선 단축), 선택적 약 참조(`pill_item_seq`·`matched_item_seq`)는 **점선**으로 핵심 관계와 분리, 그룹 라벨 겹침 제거. `ERD.svg`·`ERD.png` 재생성(4680×3120). (논리 모델 v1.2 동일, 시각만 개선)
- **ERD v1.2**: 기능 연결 5개 반영 — ①알레르기↔약(성분 마스터 `allergens` + `pill_allergens` M:N, `allergies.allergen_id`로 "못 먹는 약" 판정) ②약↔증상추천(`symptom_recommendations` M:N) ③증상추천↔대화세션(`symptom_queries.conversation_id`) ④증상추천↔건강정보(`symptom_queries.profile_id`) ⑤건강정보↔대화세션(`conversations.profile_id`). 테이블 9→**12개**. `docs/ERD.md`·`ERD.svg`·`ERD.png` 재작성(5색 기능 그룹·직교 라우팅, Edge 2x 래스터화 4680×3090).
- 백엔드를 **헥사고날 구조로 전환**: `backend/app/`(계층형 빈 스캐폴드) → `backend/apps/<도메인>/`(auth·pill·guidance, 각 `adapter`/`app`/`domain`/`tests`) + `backend/core/`. 진입점 `backend/main.py`(app/ 밖, CORS·라우터 등록 가이드 포함), `run.py`·`pytest.ini`·`requirements-test.txt` 추가. `pedantic-ritchie` 정본을 이 브랜치에 반영. `AGENTS.md` 정합, `ruff`/`pytest`/`uvicorn /health` 통과.

## 2026-06-18
- 프론트 프로토타입 UI 6화면 구현(홈·내 기록·약품 상세·기타·내 정보 입력·증상별 추천): 라이트 테마 + Pretendard 폰트, 모바일 셸, 하단 탭바, 알약 이미지(SVG), `useState` 화면 전환. 더미 데이터.
- 건강정보 `localStorage` 저장/불러오기 + 온보딩 분기. ERD를 `frontend/src/lib/types.ts` 타입으로 옮김, 화면값↔DB값 매핑(나이↔출생연도·약 텍스트↔`medications` 1:N).
- 약품 상세를 "요약 + 대화 세션 목록 + 새 대화"로 재구성. 증상별 약 추천 화면 신설(`pages/symptom`, OTC 추천 + 면책).
- ERD v1.1: `summaries` 테이블 제거 → `conversations.summary`(한 줄 요약) 흡수, `conversations.title` 제거, "대화 세션" 개념(테이블 10→9). `docs/ERD.svg`·`ERD.png` 재생성(Edge 2× 래스터화), PLAN 요약 정책을 한 줄 요약으로 정합. 6관점 워크플로 평가로 valid 지적만 반영.

## 2026-06-17
- 데이터 모델 v1 확정: [docs/ERD.md](docs/ERD.md) 신설(PostgreSQL 대상, 테이블 10개). 결정: 계정/이미지 서버 미저장 정책 + **프로토타입은 서버 미구현, 프론트 임시 저장**. PLAN 기술결정에 반영.
- ERD 다이어그램 시각화: `docs/ERD.svg`(벡터)·`docs/ERD.png`(3800×2368) 추가 — 한/영 병기·까마귀발 관계·키 배지·기능별 색 그룹·범례.
- 백엔드 정본 구조를 **헥사고날(`apps/<도메인>`)** 로 결정(아직 main 미반영, `pedantic-ritchie` 브랜치에 존재).

## 2026-06-15
- repo 공개 전환: private → **public**(커밋 이력 시크릿 스캔 클린 확인 후). free org Actions 분 제한 해소.
- 시크릿 관리 정비: `backend/.env.example` + `app/core/config.py`(pydantic-settings) 추가, GitHub secret scanning + push protection 활성화, CONTRIBUTING에 키 규칙 한 줄.
- repo를 `bestcow` 개인 → `TEAM-Cursor` Organization으로 이전(`TEAM-Cursor/pill_recognition`). 로컬 remote 갱신.
- 문서 시스템 정비: `CONVENTIONS.md`(문서 지도 + 갱신 규칙 §1~§6) 신설로 끊겨 있던 `(CONVENTIONS §N)` 참조 해소, `AGENTS.md`에 "작업할 때마다 갱신" 트리거 섹션 추가.
- GitHub private repo `bestcow/pill_recognition` 생성, `main`+`archive/expo-m0` 브랜치+`expo-m0-final` 태그 push. CODEOWNERS는 `@bestcow`로 임시(팀원 합류 시 교체). branch protection은 웹 수동 예정.

## 2026-06-14
- 프로젝트 개시. 요구사항·UI 흐름 확정, 모델(Claude)·인식 방식(비전→속성→낱알식별 API)·범위 결정. 문서 4종 생성.
- (구) Expo SDK 56 + expo-router 더미 UI 프로토타입 구현 — 이후 폐기, `archive/expo-m0` 브랜치/`expo-m0-final` 태그에 보존.
- **스택 전환**: Expo(RN) 폐기 → FastAPI(Python 3.11+) + React(TS·Vite) 웹. 초보 5인 팀 협업 골격 적용: `.github/`(CODEOWNERS·PR템플릿·CI `check.yml`)·`backend/`·`frontend/`·통합 `.gitignore`·CONTRIBUTING. backend `/health`·frontend 빌드 로컬 검증 통과. 재사용 템플릿은 `_templates/repo-scaffold/`.
