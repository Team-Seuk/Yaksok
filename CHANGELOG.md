# pill_recognition — CHANGELOG

> 날짜별 굵직한 변경 한 줄. 세세한 커밋은 git log. (CONVENTIONS §3)

## 2026-06-17
- 백엔드 구조 전환: 단순 피처 폴더 → **헥사고날(Ports & Adapters)·도메인 기반**(`C:\titanic` 참고). `backend/apps/{auth,pill,guidance}/`에 domain·app·adapter·dependencies·tests·_docs 풀 골격, 공용 `backend/core/`, 진입점 `backend/main.py` + `run.py`·`pytest.ini`·`requirements-test.txt`. 구 `backend/app/` 제거. 프론트·repo·DB는 미변경.

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
