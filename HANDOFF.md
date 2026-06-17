---
status: 개발
updated: 2026-06-17
summary: 백엔드를 titanic식 헥사고날·도메인 기반 구조로 재배치(apps/{auth,pill,guidance} 풀 골격 + core + main.py/run.py/pytest). 프론트·repo 구조는 유지. 남은 건 팀원 collaborator 추가·아이디 치환·테스트PR·branch protection(웹 수동)
repo: TEAM-Cursor/pill_recognition
---

# pill_recognition — HANDOFF

> 작업 세션 끝낼 때마다 갱신. 위 frontmatter가 상태의 단일 원본. (CONVENTIONS §4·§5)

## 마지막 작업
- **백엔드 헥사고날·도메인 구조 재배치 (2026-06-17)**: 단순 피처 폴더(`backend/app/{auth,pill,guidance,core}`)를 `C:\titanic`의 헥사고날(Ports & Adapters)·도메인 기반 구조로 전환. `backend/apps/<도메인>/`(`auth`·`pill`·`guidance`)마다 `domain/`(entities·value_objects)·`app/`(dtos·ports/{input,output}·use_cases)·`adapter/`(inbound/api/{schemas,v1}·outbound/{orm,mappers,repositories})·`dependencies/`·`tests/`(conftest 포함)·`_docs/` 풀 골격 생성(빈 `__init__.py`, 기능 코드 없음). 공용 설정은 `backend/core/config.py`로 이동, 진입점 `backend/main.py`(루트 + CORS + `/health`, 라우터 등록 자리 주석), `run.py`·`pytest.ini`·`requirements-test.txt` 추가. 구 `backend/app/`(전부 빈 파일·이전 완료) 제거. 범위는 **백엔드만** — 프론트(Vite+React)·단일 repo 구조·DB(alembic)·Docker는 의도적으로 손대지 않음. 도메인 네이밍은 평범한 이름 유지(테마 prefix 미사용, 정식 이름 미정). 검증: `ruff check` All passed, 핵심 파일 `py_compile` OK. AGENTS.md 스택·검증 섹션 갱신. CI(`check.yml`)는 `ruff check .`만 돌려 경로 영향 없음.
- **public 전환 + 시크릿 관리 정비 (2026-06-15)**: repo private→public(이력 시크릿 스캔 클린). `backend/.env.example`(키 이름만)·`app/core/config.py`(pydantic-settings 로더, 키 기본 None) 추가, `requirements.txt`에 `pydantic-settings`. GitHub secret scanning + push protection ON. CONTRIBUTING에 키 규칙.
- **org 이전 (2026-06-15)**: `bestcow/pill_recognition` → `TEAM-Cursor/pill_recognition` (GitHub Organization 전환, 폴리레포: 프로젝트 1개 = repo 1개). 로컬 remote도 갱신.
- **문서 시스템 정비**: 끊겨 있던 `(CONVENTIONS §N)` 참조 대상 [CONVENTIONS.md](CONVENTIONS.md) 신설(문서 지도 + 갱신 규칙 §1~§6). `AGENTS.md`에 "문서 시스템(작업할 때마다 갱신)" 섹션 추가 → `CLAUDE.md`가 매 세션 로드해 HANDOFF/CHANGELOG 갱신을 트리거.
- **스택 전환**: Expo(RN) 폐기 → FastAPI(Python 3.11+) + React(TS·Vite) 웹. 기존 Expo M0는 `archive/expo-m0` 브랜치 + `expo-m0-final` 태그로 보존 후 main에서 제거. 기본 브랜치 `master`→`main`.
- **협업 스캐폴드 적용**(`_templates/repo-scaffold/`에서 복사): `.github/`(CODEOWNERS·PR템플릿·`check.yml`), `backend/`(FastAPI + `/health`), `frontend/`(Vite+React+TS + Hello), `docs/`, 통합 `.gitignore`, README, CONTRIBUTING. 빈 폴더는 `.gitkeep`, 기능 코드 없음.
- **로컬 검증 통과**: frontend typecheck·lint·`vite build` clean. backend `pip install`(fastapi 0.115.14/uvicorn 0.32.1/ruff 0.7.4)→`ruff check` All passed→`uvicorn` `/health`={"status":"ok"}.
- **GitHub push 완료**: private repo `bestcow/pill_recognition` 생성, `main`+`archive/expo-m0`+`expo-m0-final` push. CODEOWNERS는 팀원 아이디 미정이라 전부 `@bestcow`로 임시.

## 다음 할 일
- **(사람)** 팀원 4명 GitHub 아이디 확정되면 CODEOWNERS의 `@bestcow`를 담당자별로 교체 + 4명 collaborator(write) 추가. (org Base permissions를 Write로 두면 collaborator 추가 없이도 push 가능)
- **(사람)** 각 팀원: `backend/.env.example` → `backend/.env` 복사 후 키 채우기. 실제 키는 비번관리자/DM으로 공유(평문·커밋 금지).
- **(사람)** 테스트 PR 1개로 `check`(backend·frontend) status check 등록 → `main` branch protection(승인1·Require Code Owners·status check·force push 차단) → Automatically delete head branches. 상세 [CONTRIBUTING.md](CONTRIBUTING.md) §5.
- 빈 헥사고날 골격(`backend/apps/<도메인>/`)에 실제 코드 채우기: 도메인 정식 이름 확정 → entity/VO → port(UseCase·Repository ABC) → interactor → adapter(라우터·ORM·repository) → `main.py`에 `include_router` 등록. 새 기능은 TDD(Red→Green→Refactor)로 `tests/<레이어>/`부터.
- 이후 M1(디자인 토큰) → M2~M4(카메라·비전·공공API·LLM) 실연동.
- frontend `npm audit`: vite/esbuild 관련 2건(dev-server 한정) — 데모엔 영향 적으나 추후 vite 메이저 업글로 정리 검토.

## 막힌 것
_해당 없음_ — branch protection·collaborator 추가는 팀원 아이디 확정 후 GitHub 웹에서 수동 진행.
