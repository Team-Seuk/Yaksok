# pill_recognition — PLAN

> 목표·범위·의사결정. 실행법·환경변수는 README. (CONVENTIONS §6)

## 목표 / 범위

알약을 카메라로 비추면, 미리 입력해 둔 **개인 정보(나이·성별·임신/수유·복용약·알레르기)** 와 **현재 시각**에 맞춰 LLM이 용법·용량·주의사항을 텍스트로 안내하는 **반응형 웹 앱(모바일 브라우저 우선)**. (예: "지금 21시라 공복 복용 시 다음날 아침 속쓰림이 있을 수 있어요.")

**범위 (포함)**
- 온보딩: 카메라 권한 → 개인정보 입력 (최초 1회).
- 홈 = 카메라(브라우저 `getUserMedia`) 뷰파인더에 알약을 맞추면 캡처 → 인식.
- 결과 = LLM 텍스트 안내. 대화 내용은 **한 줄 요약**(`conversations.summary`)으로 저장돼 '내 기록' 목록에 표시된다.
- 내비게이션: 알약사전(기록 열람·이어쓰기) / 홈(카메라) / 기타(내 정보, 증상별 약 추천).

**현재 단계**: 협업 골격(M0) 완료. 더미/실연동 기능 코드는 다음 단계.

**범위 밖**: 실제 의료 진단·처방, 결제, 약 구매.

## 기술 결정

- **스택 전환 (2026-06-14)**: 기존 Expo(React Native) 모바일 앱을 **폐기**하고 **FastAPI(Python 3.11+) 백엔드 + React(TypeScript·Vite) 웹 프론트**로 교체. 사유: 해커톤 데모를 웹으로 빠르게, 공공 API·LLM 인증키를 백엔드에서 보호, 초보 5인 팀 협업 단순화. **기존 Expo M0는 `archive/expo-m0` 브랜치 + `expo-m0-final` 태그에 보존** — `git checkout archive/expo-m0`로 복구 가능.
- **백엔드**: FastAPI. 공공 API·LLM 호출을 서버에서 수행(프론트는 백엔드 경유) → 인증키 노출 방지.
- **프론트**: React + TypeScript + Vite. 모바일 브라우저 반응형.
- **LLM / 비전**: Claude (Anthropic) — 비전+텍스트 단일 모델, 백엔드에서 호출.
- **알약 인식 파이프라인**: 낱알식별 API는 **이미지를 직접 못 받고** 색/모양/각인/분할선 등 **텍스트 속성으로 검색** → ① 비전 LLM이 사진에서 각인·색·모양·분할선 추출 → ② 낱알식별 API로 품목 매칭 → ③ 품목코드로 DUR·e약은요 조회.
- **공공데이터포털 3종**(인증키 필요, 백엔드 `.env`): ①의약품 낱알식별 정보 ②의약품안전사용서비스(DUR) ③의약품개요정보(e약은요).
- **데이터 모델 (2026-06-17 확정, v1.2 갱신)**: 대상 DB **PostgreSQL**. 전체 ERD는 [docs/ERD.md](docs/ERD.md). 핵심: `users`(계정) · `health_profiles`+`medications`+`allergies`(건강정보) · `pills`(식약처 캐시) · `scans`(인식) · `conversations`+`messages`(대화 세션·메시지, 한 줄 요약은 `conversations.summary`) · `symptom_queries`+`symptom_recommendations`(증상별 추천) · `allergens`+`pill_allergens`(알레르기 성분 매칭 → "못 먹는 약" 판정). 총 12개 테이블. **단 프로토타입 단계에선 서버/DB를 실제 구현하지 않고** 프론트 임시 저장(localStorage 등)으로 진행, 추후 이 ERD대로 백엔드 영속화.
- **개인 건강정보 저장**: 초기 프로토타입은 브라우저 `localStorage`(서버 미전송). 서버 영속화 시점의 목표 스키마는 [docs/ERD.md](docs/ERD.md).
- **인증**: 목표는 이메일+비밀번호 자체 계정. 프로토타입에선 미구현 — 시드 dev 유저 1명에 데이터 연결, 로그인은 추후.
- **촬영 이미지**: 서버 미저장. 비전 LLM 추출 속성(`scans.vision_attrs`)만 보관.
- **UI 디자인**: 공유 자산 `C:\dev\docs\web-design` 프레임워크 적용.
- **협업 구조**: 프로젝트 1개 = GitHub repo 1개. GitHub Flow(rebase 없음) + GitHub Desktop. main 보호·CODEOWNERS·PR·CI(`.github/`)로 초보 실수 차단. 상세는 [CONTRIBUTING.md](CONTRIBUTING.md).

**UI 기본값 (확정, 변경 가능)**
- 인식 성공 대화는 '내 기록'에 자동 저장 · 대화는 **한 줄 요약**으로 목록 표시 · 증상별 약 추천은 OTC 한정 + 면책 문구 · 권한 거부 시 안내 후 재요청.

## 마일스톤
- [x] M0 — 협업 스캐폴드(FastAPI+React) + CI green. backend `/health`·frontend 빌드 검증 통과
- [ ] M1 — 디자인 토큰/시그니처 확정 (web-design 프레임워크)
- [ ] M2 — 카메라 캡처 + 비전 인식 파이프라인 (Claude vision → 속성 추출)
- [ ] M3 — 공공 API 3종 연동 (백엔드, 인증키)
- [ ] M4 — LLM 안내·요약 실연동
- [ ] M5 — 알약사전 영속화 · 증상별 약 추천
