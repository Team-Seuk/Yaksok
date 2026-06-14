# pill_recognition — 에이전트/기여자 노트

## 스택
- **백엔드**: FastAPI (Python 3.11+). `backend/app/` — `auth/`(로그인·회원), `pill/`(핵심 기능), `core/`(DB·공통 설정, 위험 공용구역). 진입점 `app/main.py`.
- **프론트**: React + TypeScript + Vite. `frontend/src/` — `pages/{auth,pill}/`, `components/`(재사용), `api/`(백엔드 호출).
- 공공 API·LLM(Claude) 호출은 **백엔드에서**. 인증키는 `backend/.env`(절대 커밋 금지).

## 협업 규칙 (GitHub Flow, rebase 없음)
- `main` 직접 작업 금지. `feat/<이름>` / `fix/<이름>` 브랜치 → PR → 승인 → merge.
- `core/`·`.github/`·`*.yml`·의존성 파일은 CODEOWNERS상 팀 리드 승인 필요.
- 정확한 루틴·금지사항은 [CONTRIBUTING.md](CONTRIBUTING.md).

## 검증 (변경 후 실행)
- backend: `cd backend && ruff check .` · `uvicorn app.main:app --reload` → `/health`
- frontend: `cd frontend && npm run typecheck && npm run lint && npm run build`
- 이 검사들은 PR에서 `.github/workflows/check.yml`로도 자동 실행되며 통과해야 merge 가능.

## 정확성
- 라이브러리 API는 추측 금지. 버전에 따라 동작이 다르면 공식 문서 확인.

> 이전 Expo(React Native) 프로토타입은 `archive/expo-m0` 브랜치 / `expo-m0-final` 태그에 보존. 현재 스택과 무관.
