# pill_recognition — LOG

> 날짜별 굵직한 변경 한 줄. 세세한 커밋은 git log. (CONVENTIONS §3)

## 2026-06-21
- 백엔드 도구 **_template 표준 정렬**: pip→uv(`pyproject.toml`+`uv.lock`), Python 3.11→3.12, ruff 강화(UP·B·SIM)+format-check, mypy·import-linter(피처별 5계약) 추가, CI를 uv 파이프라인으로(+pytest 실행)·스모크 테스트 1개. 옛 `requirements*.txt`/`ruff.toml`/`pytest.ini` 제거, CODEOWNERS 죽은 경로 수정. 구조·프론트·문서 유지. 로컬 검증 그린.
- **CODEOWNERS 역할 기반 재구성**: 기능별→역할별. `/backend/`→@minahdev(BE), `/frontend/`→@cloverky(FE), 위험·설정·문서→@suvisdev(PL/진수택). PO(@bestcow)·SM(@woojeongalex)은 코드오너 제외(일반 리뷰).

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
