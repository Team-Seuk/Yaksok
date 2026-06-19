---
status: 개발
updated: 2026-06-19
summary: ①백엔드 헥사고날 전환(backend/app/ → backend/apps/<도메인>+core/, 진입점 main.py, run.py·pytest.ini) ②ERD v1.2(기능 연결 5개, 테이블 9→12: allergens+pill_allergens, symptom_recommendations 등) ③ERD 다이어그램 가독성 개선·관계 라벨 제거 — 모두 **PR #2~4로 main 머지 완료**. md 정합(README uvicorn 경로·PLAN 데이터모델·CHANGELOG) 갱신함. 프론트는 프로토타입 UI 6화면 + 건강정보 localStorage(나머지 더미·미연결) 유지. 다음: 프론트 세부 구현 또는 백엔드 도메인 로직.
repo: TEAM-Cursor/pill_recognition
---

# pill_recognition — HANDOFF

> 작업 세션 끝낼 때마다 갱신. 위 frontmatter가 상태의 단일 원본. (CONVENTIONS §4·§5)

## 마지막 작업
- **md 문서 정합 (2026-06-19)**: 코드/ERD 변경 대비 stale 문서 수정 — `README.md` 백엔드 실행 `uvicorn app.main:app`→`main:app`(헥사고날 반영, 실행 깨짐 수정), `PLAN.md` 데이터모델 v1.2 반영(증상추천·성분매칭 테이블 추가, 총 12개), `CHANGELOG.md` 라벨 제거 한 줄 추가, 본 HANDOFF 머지 상태 갱신.
- **ERD 다이어그램 가독성 개선·라벨 제거 (2026-06-19, PR #3·#4 머지)**: 레이아웃 재배치(성분 매칭 `allergens`를 `allergies` 바로 아래로 → 매칭 선 단축), 선택적 약 참조(`pill_item_seq`·`matched_item_seq`)는 **점선**으로 핵심 관계와 분리, 그룹 라벨 겹침 제거, 선 위 설명 텍스트 라벨 전부 제거. viewBox 1560×1040, [docs/ERD.png](docs/ERD.png) Edge 2x 재생성(4680×3120).
- **ERD v1.2 — 기능 연결 5개 (2026-06-19, PR #2 머지)**: ①알레르기↔약: 성분 마스터 `allergens`(id,name) + `pill_allergens`(약↔성분 M:N) 신설, `allergies.allergen_id`(FK?) 추가 → 사용자 알레르기 ∩ 약 성분으로 "못 먹는 약" 판정. ②약↔증상추천: `symptom_recommendations`(symptom_query_id, pill_item_seq, rank, reason) 신설. ③증상추천↔대화세션: `symptom_queries.conversation_id`(FK?). ④증상추천↔건강정보: `symptom_queries.profile_id`(FK?). ⑤건강정보↔대화세션: `conversations.profile_id`(FK?). 테이블 9→12. [docs/ERD.md](docs/ERD.md)(mermaid+DDL+관계표+설계메모)·[docs/ERD.svg](docs/ERD.svg) 전면 재작성. **`frontend/src/lib/types.ts`는 미반영**(건강정보 화면만 쓰고 새 관계는 프론트 미사용 → 범위 밖, 서버 영속화 때 함께 정합).
- **백엔드 헥사고날 구조 전환 (2026-06-19, PR #2 머지)**: `backend/app/`(계층형 빈 스캐폴드)를 `claude/pedantic-ritchie-149dd1` 정본으로 교체. 결과 구조: `backend/apps/{auth,pill,guidance}/`(각 `adapter/`{inbound·outbound}·`app/`{use_cases·ports·dtos}·`domain/`{entities·value_objects}·`tests/`·`dependencies/`·`_docs/`) + `backend/core/`(config) + 진입점 `backend/main.py`(app/ 밖, CORS localhost:5173·라우터 등록 가이드) + `run.py`·`pytest.ini`·`requirements-test.txt`. 전부 빈 `__init__.py` 스캐폴드(로직 없음). `AGENTS.md` 스택/검증 섹션 정합. 검증: `ruff check .` All passed · `pytest` 수집 0건(정상) · `uvicorn main:app`→`/health`={"status":"ok"}.
- **라이트 테마 전환 + 증상별 추천 화면 + ERD v1.1 (2026-06-18)**: 5화면 다크→라이트 톤 전환(오프화이트+teal, 상단 teal 안개, 홈 뷰파인더 흰 카드), Pretendard 폰트. 증상별 약 추천 화면 신설(`pages/symptom`, 기타 진입, OTC 추천+면책). 약품 상세를 "요약+대화 세션 목록+＋새 대화"로 재구성. ERD v1.1 정리(`summaries` 제거→`conversations.summary`, `title` 제거, 테이블 10→9)를 `docs/ERD.md`·`ERD.svg`·`ERD.png`(Edge 래스터화)에 반영, PLAN 요약 정책 정합. 6관점 워크플로 평가 결과 대부분 프로토타입 단계상 의도적 생략으로 확인, valid 지적만 반영.
- **프론트 프로토타입 UI + 건강정보 저장 (2026-06-18)**: `frontend/src`에 5화면 구현 — 홈(카메라 뷰파인더)·내 기록(`cabinet`)·약품 상세(`result`)·기타(`more`)·내 정보 입력(`profile`). 다크+teal 디자인 토큰(`styles/theme.css`), 하단 탭바, 알약 이미지(`components/PillImage.tsx`, 모양·색 SVG), 화면 전환은 라우터 없이 `App.tsx` `useState`. **건강정보만 실연결**: `lib/types.ts`(ERD→TS 타입)·`lib/storage.ts`(localStorage, 시드 dev 유저 id=1)로 내 정보 입력 저장/불러오기 + 온보딩 분기(정보 없으면 입력화면부터). 화면값↔ERD 매핑(나이↔birthYear·여성↔F·약 텍스트↔medications 1:N). typecheck·lint·build 통과. **나머지(내 기록·약품 상세·세션 카드·증상별 추천)는 더미·미연결.**
- **ERD 다이어그램 시각화 (2026-06-17)**: [docs/ERD.svg](docs/ERD.svg)(벡터) + [docs/ERD.png](docs/ERD.png)(3800×2368, Edge 헤드리스로 래스터화) 추가. 한/영 컬럼 병기, 까마귀발 관계 표기(1·0..1·N·0..N), PK/FK/FK?/UQ 배지, 기능별 색 그룹(계정·건강 / 인식·대화 / 약), 범례 상세화. SVG 수정 시 동일 Edge 명령으로 PNG 재생성. 커밋 `b0da2aa`까지 로컬 main 머지(push 안 함).
- **백엔드 폴더 구조 정본 결정 (2026-06-17)**: worktree마다 구조가 갈려 있음 확인 — 현 main/이 worktree는 계층형 `backend/app/{auth,core,guidance,pill}`(빈 스캐폴드), 다른 worktree(`pedantic-ritchie`)는 헥사고날 `backend/apps/<도메인>/{adapter,app,domain,tests}`. **정본은 헥사고날로 결정**(아직 main 미반영). ERD는 데이터 모델이라 폴더 구조와 독립 — 단 헥사고날에선 도메인 경계 넘는 FK는 DB 제약이 아니라 논리 ID 참조로 봐야 함.
- **데이터 모델 v1 확정 (2026-06-17)**: 앱 핵심 기능 기준 ERD 설계 → [docs/ERD.md](docs/ERD.md) 신설(mermaid 다이어그램 + DDL + 관계 + 결정). 대상 DB PostgreSQL. 결정: ①계정은 이메일+비번 스키마만 두고 프로토타입 인증 미구현(시드 dev 유저) ②촬영 이미지 서버 미저장(vision_attrs만) ③**프로토타입 단계에선 서버/DB 미구현, 프론트 임시 저장으로 진행**. PLAN.md 기술결정에 반영·링크.
- **public 전환 + 시크릿 관리 정비 (2026-06-15)**: repo private→public(이력 시크릿 스캔 클린). `backend/.env.example`(키 이름만)·`app/core/config.py`(pydantic-settings 로더, 키 기본 None) 추가, `requirements.txt`에 `pydantic-settings`. GitHub secret scanning + push protection ON. CONTRIBUTING에 키 규칙.
- **org 이전 (2026-06-15)**: `bestcow/pill_recognition` → `TEAM-Cursor/pill_recognition` (GitHub Organization 전환, 폴리레포: 프로젝트 1개 = repo 1개). 로컬 remote도 갱신.
- **문서 시스템 정비**: 끊겨 있던 `(CONVENTIONS §N)` 참조 대상 [CONVENTIONS.md](CONVENTIONS.md) 신설(문서 지도 + 갱신 규칙 §1~§6). `AGENTS.md`에 "문서 시스템(작업할 때마다 갱신)" 섹션 추가 → `CLAUDE.md`가 매 세션 로드해 HANDOFF/CHANGELOG 갱신을 트리거.
- **스택 전환**: Expo(RN) 폐기 → FastAPI(Python 3.11+) + React(TS·Vite) 웹. 기존 Expo M0는 `archive/expo-m0` 브랜치 + `expo-m0-final` 태그로 보존 후 main에서 제거. 기본 브랜치 `master`→`main`.
- **협업 스캐폴드 적용**(`_templates/repo-scaffold/`에서 복사): `.github/`(CODEOWNERS·PR템플릿·`check.yml`), `backend/`(FastAPI + `/health`), `frontend/`(Vite+React+TS + Hello), `docs/`, 통합 `.gitignore`, README, CONTRIBUTING. 빈 폴더는 `.gitkeep`, 기능 코드 없음.
- **로컬 검증 통과**: frontend typecheck·lint·`vite build` clean. backend `pip install`(fastapi 0.115.14/uvicorn 0.32.1/ruff 0.7.4)→`ruff check` All passed→`uvicorn` `/health`={"status":"ok"}.
- **GitHub push 완료**: private repo `bestcow/pill_recognition` 생성, `main`+`archive/expo-m0`+`expo-m0-final` push. CODEOWNERS는 팀원 아이디 미정이라 전부 `@bestcow`로 임시.

## 다음 할 일
- **프론트 세부 구현(진행 중)**: ①세션→개별 대화 화면(말풍선+입력, `messages`) ②내 기록·약품 상세를 더미 대신 저장소 데이터로 연결 ③증상별 추천 결과를 `symptom_queries`로 저장.
- **서버 영속화(M5) 때 챙길 ERD 항목**(평가에서 도출, 지금은 불필요): `sex/status/role` CHECK 제약, `conversations.updated_at` 자동 갱신 트리거, "사용자 데이터 조회는 user_id 필터 강제" 명문화, DUR 약물 상호작용 구조화.
- **(사람)** 팀원 4명 GitHub 아이디 확정되면 CODEOWNERS의 `@bestcow`를 담당자별로 교체 + 4명 collaborator(write) 추가. (org Base permissions를 Write로 두면 collaborator 추가 없이도 push 가능)
- **(사람)** 각 팀원: `backend/.env.example` → `backend/.env` 복사 후 키 채우기. 실제 키는 비번관리자/DM으로 공유(평문·커밋 금지).
- **(사람)** 테스트 PR 1개로 `check`(backend·frontend) status check 등록 → `main` branch protection(승인1·Require Code Owners·status check·force push 차단) → Automatically delete head branches. 상세 [CONTRIBUTING.md](CONTRIBUTING.md) §5.
- **백엔드 도메인 로직 구현(헥사고날 위)**: main에 머지된 `apps/<도메인>` 빈 스캐폴드에 엔티티·value_object·use_case·port·adapter(라우터) 구현. ERD v1.2 기준, `pill` 도메인(핵심 식별·안내)부터.
- **ERD 후속 결정**: 건강정보(`health_profiles`/`medications`/`allergies`)를 `profile` 도메인으로 분리할지 / 헥사고날 도메인 경계 넘는 FK를 다이어그램에 점선(약결합)으로 표시할지.
- ERD 확정됨 → 프로토타입은 [docs/ERD.md](docs/ERD.md) 구조를 프론트 임시 저장(localStorage 등)으로 흉내. 서버 영속화는 추후 같은 스키마로.
- 이후 M1(디자인 토큰) → M2~M4(카메라·비전·공공API·LLM) 실연동.
- frontend `npm audit`: vite/esbuild 관련 2건(dev-server 한정) — 데모엔 영향 적으나 추후 vite 메이저 업글로 정리 검토.

## 막힌 것
_해당 없음_ — branch protection·collaborator 추가는 팀원 아이디 확정 후 GitHub 웹에서 수동 진행.
