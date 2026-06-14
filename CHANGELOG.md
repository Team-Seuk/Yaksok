# pill_recognition — CHANGELOG

> 날짜별 굵직한 변경 한 줄. 세세한 커밋은 git log. (CONVENTIONS §3)

## 2026-06-14
- 프로젝트 개시. 요구사항·UI 흐름 확정, 모델(Claude)·인식 방식(비전→속성→낱알식별 API)·범위 결정. 문서 4종 생성.
- (구) Expo SDK 56 + expo-router 더미 UI 프로토타입 구현 — 이후 폐기, `archive/expo-m0` 브랜치/`expo-m0-final` 태그에 보존.
- **스택 전환**: Expo(RN) 폐기 → FastAPI(Python 3.11+) + React(TS·Vite) 웹. 초보 5인 팀 협업 골격 적용: `.github/`(CODEOWNERS·PR템플릿·CI `check.yml`)·`backend/`·`frontend/`·통합 `.gitignore`·CONTRIBUTING. backend `/health`·frontend 빌드 로컬 검증 통과. 재사용 템플릿은 `_templates/repo-scaffold/`.
