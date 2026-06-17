# pill_recognition — 에이전트/기여자 노트

## 스택
- **백엔드**: FastAPI (Python 3.11+). 헥사고날(Ports & Adapters)·도메인 기반 구조. `backend/apps/<도메인>/`(현재 `auth`·`pill`·`guidance`)가 각각 `domain/`(entities·value_objects) → `app/`(dtos·ports/{input,output}·use_cases) → `adapter/`(inbound/api/{schemas,v1}·outbound/{orm,mappers,repositories}) + `dependencies/`(DI) + `tests/` + `_docs/` 풀세트. **의존성 방향 adapter → app → domain**(역방향 임포트 금지, 타입 힌트는 `TYPE_CHECKING` 가드). 공용 설정·DB는 `backend/core/`. 진입점 `backend/main.py`(도메인 라우터를 `include_router`로 등록).
- **프론트**: React + TypeScript + Vite. `frontend/src/` — `pages/{auth,pill}/`, `components/`(재사용), `api/`(백엔드 호출).
- 공공 API·LLM(Claude) 호출은 **백엔드에서**. 인증키는 `backend/.env`(절대 커밋 금지).

## 협업 규칙 (GitHub Flow, rebase 없음)
- `main` 직접 작업 금지. `feat/<이름>` / `fix/<이름>` 브랜치 → PR → 승인 → merge.
- `core/`·`.github/`·`*.yml`·의존성 파일은 CODEOWNERS상 팀 리드 승인 필요.
- 정확한 루틴·금지사항은 [CONTRIBUTING.md](CONTRIBUTING.md).

## 검증 (변경 후 실행)
- backend: `cd backend && ruff check .` · `uvicorn main:app --reload` → `/health` · `pytest`(도메인별 `apps/<도메인>/tests/`)
- frontend: `cd frontend && npm run typecheck && npm run lint && npm run build`
- 이 검사들은 PR에서 `.github/workflows/check.yml`로도 자동 실행되며 통과해야 merge 가능.

## 정확성
- 라이브러리 API는 추측 금지. 버전에 따라 동작이 다르면 공식 문서 확인.

## 문서 시스템 (작업할 때마다 갱신)
이 repo의 md는 항상 "현재 상태"를 반영해야 한다. 규칙 전문·문서 지도는 [CONVENTIONS.md](CONVENTIONS.md).
- **세션 시작**: [HANDOFF.md](HANDOFF.md) 먼저 읽어 상태·다음 할 일 파악.
- **세션 종료 전**: HANDOFF.md 본문(마지막 작업/다음 할 일/막힌 것)과 frontmatter(`updated`·`summary`)를 갱신. 굵직한 변경이면 [CHANGELOG.md](CHANGELOG.md)에 한 줄 추가.
- **코드와 문서가 어긋나면 코드가 정답** — 발견 즉시 해당 문서 수정.
- 역할 분리: HANDOFF=현재 상태 · CHANGELOG=변경 이력 · PLAN=목표/결정 · README=실행법. (세부는 CONVENTIONS §1~§6)

> 이전 Expo(React Native) 프로토타입은 `archive/expo-m0` 브랜치 / `expo-m0-final` 태그에 보존. 현재 스택과 무관.
