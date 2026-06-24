# P2 — 데이터 + 매칭 (pill 데이터 파이프라인)

> 알약 식별의 **정확도 핵심**. 공공데이터를 적재하고, 속성으로 후보 약을 찾는 매칭을 만든다.
> 전체 그림·계약·공용 기반 사용법은 [README](README.md) 먼저. P1은 완료됨([P1](P1-foundation.md)).

## 담당 영역
`backend/apps/pill/adapter/outbound/` (orm·repositories·mappers), `backend/scripts/fetch_pills.py`, pill 조회·매칭 use_case(`apps/pill/app/`).

## 의존 / 시작점
- **P1 완료** → `core.db`의 `Base`/`get_db`를 그대로 쓴다.
- 공공API 키 동기화 대기 중 → **샘플 데이터 수십 건**으로 테이블·매칭 먼저 검증.
- ⚠️ P3가 `apps.pill`을 같이 만진다(같은 도메인). 폴더로 분리: **P2=outbound+매칭 use_case**, P3=inbound+Vision. 충돌 나면 합의.

## 작업 체크리스트
### 1. 데이터 수집·적재
- [ ] `scripts/fetch_pills.py` 마무리(현재 `frontend/public/data/pills.json` 생성). **DB 적재 경로 추가**.
- [ ] 낱알식별 컬럼(모양·색앞/뒤·각인앞/뒤·분할선·크기·제형·전문일반·이미지URL) → `pills` 테이블 매핑.
- [ ] 키 풀리면 전량 페이징 적재, 그 전엔 샘플로.

### 2. ORM + 리포지토리
- [ ] `apps/pill/adapter/outbound/orm/` 에 `Pill(Base)` 모델(README의 db 사용법 참고).
- [ ] `apps/pill/adapter/outbound/repositories/` 에 조회·검색·필터 구현, `apps/pill/app/ports/output`의 리포지토리 Protocol을 구현.
- [ ] 알약사전 목록/검색 use_case(이름·성분·분류 부분매칭).

### 3. 속성 → 후보 매칭 (핵심)
- [ ] 입력: `{shape, colorFront, colorBack, printFront, printBack, line}` (P3 Vision이 채움).
- [ ] DB 후보 필터 + **스코어링**(완전일치 우선, 색/각인 부분일치 가중) → 상위 N 후보.
- [ ] 각인 정규화(공백·대소문자·유사문자).
- [ ] **P3에 노출할 매칭 port 시그니처**를 Day0 규약대로 고정: 예) `match(attrs: PillAttrs) -> list[PillCandidate]`.

## 산출물
- `pills` 테이블 + 리포지토리 + `match_candidates(attrs)` use_case + 알약사전 조회 use_case.

## 검증
```bash
cd backend
uv run pytest apps/pill           # 샘플 데이터로 "이 속성 → 이 약 1순위" 단위테스트
uv run ruff check . && uv run mypy && uv run lint-imports
```
