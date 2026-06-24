# P4 — 복약 상담 (guidance 도메인)

> 사용자 질문에 **Gemini LLM**이 건강정보를 반영해 안전하게 답하고, 대화/메시지를 영속화한다.
> 전체 그림·계약·공용 기반 사용법은 [README](README.md) 먼저. P1은 완료됨([P1](P1-foundation.md)).

## 담당 영역
`backend/apps/guidance/` **전체** (inbound api · outbound Gemini/리포지토리 · app use_cases/ports · domain · orm). 도메인이 독립이라 **가장 자유롭게 병렬 가능**.

## 의존 / 시작점
- **P1 완료** → `core.gemini.generate(prompt)`(LLM), `core.db`의 `Base`/`get_db`(영속화) 사용(README 참고).
- 다른 도메인(pill·auth) import 금지(계약). 약 식별 결과가 필요하면 **요청 DTO로 받기**(직접 import 금지).

## 작업 체크리스트
### 1. 대화 API + 영속화
- [ ] `POST /api/guidance/conversations/{id}/messages`(질문→답변), 대화 조회 API.
- [ ] ERD `conversations`·`messages` ORM(`apps/guidance/adapter/outbound/orm/`) + 리포지토리.
- [ ] (선택) `symptom_queries`(증상 기반 추천) 연계.

### 2. Gemini LLM 연결 + 프롬프트 (핵심)
- [ ] outbound adapter가 `core.gemini.generate`를 감싸 `app/ports/output`의 LLM port 구현(README의 DI 패턴).
- [ ] **시스템 프롬프트 설계**:
  - 사용자 **건강정보 반영**: 알레르기·임신/수유·복용 중 약·기저질환.
  - 위험 상호작용·금기 경고 + **면책**(의료 조언 아님, 약사·의사 상담 권고).
  - 페르소나 **'프로미'**(다정·쉬운 설명, 고령 가독성).
- [ ] 약 맥락(P3 식별 결과 등)을 대화에 끼워넣는 컨텍스트 주입.

### 3. use_case
- [ ] `AskGuidance`: 건강정보+질문 → LLM port 호출 → 메시지 저장 → 응답. LLM port·리포지토리 port 주입.
- [ ] 건강정보를 요청 DTO로 받을지/서버 조회할지 Day0 규약대로.

## 산출물
- 동작하는 상담 API — 질문 넣으면 건강정보 반영 답변 + 대화 저장(키 있으면 e2e).

## 검증
```bash
cd backend
uv run ruff check . && uv run mypy && uv run lint-imports && uv run pytest
uv run uvicorn main:app --reload
# 대화 생성 → 메시지 전송 → 답변 확인. 알레르기/임신 케이스 프롬프트 회귀테스트 권장.
```
