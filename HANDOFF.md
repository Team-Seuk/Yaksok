---
status: 개발
updated: 2026-06-14
summary: Expo 폐기 → FastAPI+React 협업 스캐폴드 적용(빈 스켈레톤+health/Hello 스텁+CI). 로컬 검증 통과, 팀 GitHub 셋업·아이디 placeholder 대기
---

# pill_recognition — HANDOFF

> 작업 세션 끝낼 때마다 갱신. 위 frontmatter가 상태의 단일 원본. (CONVENTIONS §4·§5)

## 마지막 작업
- **스택 전환**: Expo(RN) 폐기 → FastAPI(Python 3.11+) + React(TS·Vite) 웹. 기존 Expo M0는 `archive/expo-m0` 브랜치 + `expo-m0-final` 태그로 보존 후 main에서 제거. 기본 브랜치 `master`→`main` 개명.
- **협업 스캐폴드 적용**(`_templates/repo-scaffold/`에서 복사): `.github/`(CODEOWNERS·PR템플릿·`check.yml`), `backend/`(FastAPI 골격 + `/health`), `frontend/`(Vite+React+TS 골격 + Hello), `docs/`, 통합 `.gitignore`, README, CONTRIBUTING. 빈 폴더는 `.gitkeep`, 기능 코드 없음.
- **토큰 치환**: `{{PROJECT}}`→pill_recognition, `{{FEATURE}}`→pill. 담당자/REPO placeholder는 미치환(사람이 채움).
- **로컬 검증 통과**: frontend `npm install`→typecheck·lint·`vite build`(dist 생성) 전부 clean. backend venv `pip install`(fastapi 0.115.14/uvicorn 0.32.1/ruff 0.7.4)→`ruff check` All passed→`uvicorn` `/health`={"status":"ok"}.

## 다음 할 일
- **(사람)** CODEOWNERS·CONTRIBUTING의 `{{TEAMLEAD}}`·`{{OWNER_*}}`·`{{REPO}}`를 실제 GitHub 아이디로 치환.
- **(사람)** GitHub에 빈 repo `pill_recognition` 생성 → `main` + `archive/expo-m0` 브랜치 + `expo-m0-final` 태그 push → 팀원 4명 write 권한.
- **(사람)** 테스트 PR 1개로 `check`(backend·frontend) 등록 → branch protection(승인1·Code Owners·status check·force push 차단) → Automatically delete head branches. 상세 [CONTRIBUTING.md](CONTRIBUTING.md) §5.
- 이후 M1(디자인 토큰) → M2~M4(카메라·비전·공공API·LLM) 실연동.
- frontend `npm audit`: vite/esbuild 관련 2건(dev-server 한정) — 데모엔 영향 적으나 추후 vite 메이저 업글로 정리 검토.

## 막힌 것
_해당 없음_ — 단, branch protection은 GitHub 웹 수동 설정이라 팀원 아이디 확정 전까지 보류.
