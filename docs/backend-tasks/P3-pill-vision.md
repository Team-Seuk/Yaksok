# P3 — 알약 인식 (pill 카메라·Vision)

> 사진을 받아 **Gemini Vision으로 속성을 뽑고**, P2 매칭에 넘겨 후보를 돌려준다.
> 전체 그림·계약·공용 기반 사용법은 [README](README.md) 먼저. P1은 완료됨([P1](P1-foundation.md)).

## 담당 영역
`backend/apps/pill/adapter/inbound/api/` (업로드 엔드포인트·스키마), `apps/pill/adapter/outbound/`의 Gemini Vision 어댑터, 인식 use_case(`apps/pill/app/`).

## 의존 / 시작점
- **P1 완료** → `core.gemini.generate(...)` + `core.gemini.image_part(...)` 사용(README 참고).
- **P2 매칭은 스텁으로 먼저 시작** — `match()`가 가짜 후보를 반환하게 두고 Vision·엔드포인트부터. P2 완료 후 실제 구현으로 교체.
- ⚠️ P2와 같은 `apps.pill` 도메인. **P3=inbound+Vision**, P2=outbound+매칭으로 폴더 분리.

## 작업 체크리스트
### 1. 업로드 엔드포인트
- [x] `POST /api/pill/identify` (multipart 이미지 1장, 필드명 `file`). 요청/응답 스키마.
- [x] 이미지 검증(용량 ≤8MB·포맷 jpeg/png/webp, 415/400/413). **사진은 식별에만, 서버 저장 안 함**(ERD 결정: vision 속성만).

### 2. Gemini Vision 프롬프트 (핵심)
- [x] 사진 → **구조화 JSON** 추출: `{shape, color_front, color_back, imprint_front, imprint_back, score_line, form}`.
- [x] 자유서술 말고 **정해진 enum 값**으로 뽑게: 한국 낱알식별 분류(모양/색)를 프롬프트에 명시 + `response_schema`로 강제.
  ```python
  from core import gemini
  from google.genai import types
  cfg = types.GenerateContentConfig(response_mime_type="application/json", response_schema=PillAttrsSchema)
  raw = gemini.generate(["이 알약 속성을 추출해", gemini.image_part(buf, "image/jpeg")], config=cfg)
  ```
- [x] outbound adapter(`gemini_vision_adapter.py`)가 위 호출을 감싸 `app/ports/output`의 Vision port 구현.

### 3. use_case
- [x] `IdentifyPillUseCase`: Vision port로 속성 추출 → **P2 `PillRepositoryPort.filter_candidates`** 로 후보 조회 → 응답 조립. Vision·repo 주입(`dependencies/__init__.py`: Vision은 키 있으면 실제 Gemini·없으면 fake / repo는 P2 `PillRepository(core.db)`). Vision `PillAttributes`(enum)→P2 `PillAttrs`(식약처 raw) 매핑(각인 `imprint→print`, 분할선 `line_front`/`line_back`, 색 "하양").

### 4. 응답
- [x] 추출 속성 + 후보 약(P2 `PillCandidate`: item_seq·item_name·entp_name·shape·color·print·image_url·is_otc·**score**). 후보 0개/저점수(`_MIN_SCORE=2.0`) → `needs_retry`로 재촬영 안내.

## 산출물
- [x] 동작하는 `POST /api/pill/identify`(필드 `file`) — 사진 넣으면 P2 매칭 후보 반환(키+DB+적재데이터 있으면 실제 e2e, 없으면 fake 주입 테스트). 검증 ruff·mypy(104)·lint-imports(5 KEPT)·**pytest(17)** 그린.
- **남음**: ① `main.py` 라우터 등록 2줄 해제(**P1/공용구역**) ② 공공API 실데이터 적재(`fetch_pills.py`, 키 동기화 대기) 후 **`line_front/back` 식약처 raw 표기 P2와 확인**(현재 "-"/"+" 가정).

## 검증
```bash
cd backend
uv run ruff check . && uv run mypy && uv run lint-imports && uv run pytest
uv run uvicorn main:app --reload
# 샘플 사진으로 호출:  curl -k -F "file=@pill.jpg" https://127.0.0.1:8000/api/pill/identify
```
