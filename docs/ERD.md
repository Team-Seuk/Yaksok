# Yaksok — ERD (데이터 모델)

> 데이터 모델의 단일 출처. 목표/결정 맥락은 [PLAN.md](../PLAN.md), 문서 규칙은 [CONVENTIONS.md](../CONVENTIONS.md).
> **상태**: v1.4 (2026-06-23) · 대상 DB **PostgreSQL**.
> **v1.4 변경**: `health_profiles`에 선택 입력 3개 컬럼 추가 — `blood_pressure`(혈압, 예 "120/80")·`medical_history`(병력)·`bmi`. 모두 nullable(선택). 출생연도·성별·임신/수유는 필수, 나머지는 건강검진/검사 결과 문서 촬영으로 자동 채우거나 사용자가 직접 입력.
> **v1.3 변경**: 실제 화면 의도와의 정합 정제(테이블 12개 유지). ①`conversations` 약 참조 정본화(약=`pill_item_seq`, `scan_id`=출처 기록용 → 이중 도출 제거). ②`symptom_queries.conversation_id` 제거(증상 추천은 독립 원샷 플로우라 미사용). ③`symptom_recommendations`: `pill_item_seq` nullable + `item_name` 스냅샷(추천 OTC가 `pills` 캐시에 없어도 보존). ④cross-domain 참조를 논리참조(`FK?`)로 일관화, `sex`/`role`/`status` CHECK·`updated_at` 트리거 명시. ⑤`pill_allergens` 성분 데이터 소스 미확인 caveat.
> **v1.2 변경**: 기능 연결 5개 반영. ①알레르기↔약: 성분 마스터 `allergens` + `pill_allergens`(약↔성분 M:N) 신설, `allergies`가 `allergen_id`로 성분 참조 → "못 먹는 약" 판정. ②약↔증상추천: `symptom_recommendations`(증상추천↔약 M:N) 신설. ③증상추천↔대화세션: `symptom_queries.conversation_id`. ④증상추천↔건강정보: `symptom_queries.profile_id`. ⑤건강정보↔대화세션: `conversations.profile_id`. 테이블 9 → **12개**.
> **v1.1 변경**: `summaries`(버전 누적 요약) 테이블 제거 → `conversations.summary`(한 줄 요약)로 흡수. `conversations.title` 제거(요약으로 목록 표시 통일). `conversations`를 "대화 세션"(클로드 채팅처럼 세션 단위로 저장)으로 정리. 테이블 10 → 9개.
> **단, 프로토타입 단계에선 서버/DB를 실제 구현하지 않는다** — 프론트 임시 저장(localStorage 등)으로 진행하고, 추후 백엔드 영속화 시 이 스키마대로 구현한다.

## 결정 요약

- **계정**: `users`(이메일+비밀번호) 스키마는 둔다. **프로토타입에선 인증 미구현** — 시드 dev 유저 1명에 모든 row를 연결. 로그인은 나중에 얹는다.
- **건강정보**: 목표 스키마는 서버 DB(`health_profiles`/`medications`/`allergies`). 프로토타입은 위 방침대로 임시 저장. (PLAN 초기안의 localStorage → 서버 DB로 방향 확정, 단 구현은 추후)
- **촬영 이미지**: **서버에 저장하지 않는다.** 비전 LLM이 추출한 속성(`scans.vision_attrs`)만 보관. (`pills.image_url`은 식약처가 제공하는 약 사진으로, 우리 촬영본과 무관.)
- **약 데이터**: 식약처 3종 API(낱알식별·DUR·e약은요) 결과를 `pills`에 품목코드(`item_seq`) 기준으로 캐시.
- **대화 세션**: `conversations` = 약 1건에 대한 **대화 세션**(클로드 채팅의 한 대화방). 인식 성공 시 자동 생성(`scan_id`). 세션 목록의 진입 버튼엔 제목 대신 **`summary`(한 줄 요약) + `updated_at`** 을 띄운다. 주고받은 말풍선은 `messages`(세션 1:N). 약 참조는 `pill_item_seq`가 정본, `scan_id`는 출처 기록용(약을 두 경로로 도출하지 않음).
- **알레르기 매칭**: 알레르기 유발 성분을 마스터 `allergens`로 정규화. 사용자 알레르기(`allergies.allergen_id`)와 약 성분(`pill_allergens`)이 같은 성분을 가리켜, "사용자 알레르기 ∩ 약 성분 ≠ ∅" 이면 **못 먹는 약**으로 판정. 자유 입력으로 마스터에 없으면 `allergen_id`는 null 허용.
- **증상별 추천**: `symptom_queries`는 '기타→증상별 추천'에서 들어가는 **독립 원샷 플로우**(증상 텍스트 + 건강정보 `profile_id`)로 OTC를 추천. 추천된 약은 `symptom_recommendations`에 `item_name` 스냅샷으로 남기고, `pills` 캐시에 있으면 `pill_item_seq`(nullable)로 연결해 상세로 들어간다. 원본 `result` jsonb는 보관용 유지.

## 다이어그램

```mermaid
erDiagram
  users ||--o| health_profiles : has
  users ||--o{ scans : scans
  users ||--o{ conversations : owns
  users ||--o{ symptom_queries : asks
  health_profiles ||--o{ medications : takes
  health_profiles ||--o{ allergies : has
  health_profiles ||--o{ conversations : context
  health_profiles ||--o{ symptom_queries : context
  allergens ||--o{ allergies : classifies
  allergens ||--o{ pill_allergens : in
  pills ||--o{ pill_allergens : contains
  pills ||--o{ scans : matched_by
  pills ||--o{ conversations : about
  pills ||--o{ medications : ref
  pills ||--o{ symptom_recommendations : suggested
  scans ||--o| conversations : creates
  conversations ||--o{ messages : has
  symptom_queries ||--o{ symptom_recommendations : has

  users {
    bigserial id PK
    text email UK
    text password_hash
    text nickname
    timestamptz created_at
  }
  health_profiles {
    bigserial id PK
    bigint user_id FK
    int birth_year
    text sex "M|F|other"
    boolean is_pregnant
    boolean is_breastfeeding
    text blood_pressure "선택 · 예 120/80"
    text medical_history "선택 · 병력"
    numeric bmi "선택"
    timestamptz updated_at
  }
  medications {
    bigserial id PK
    bigint profile_id FK
    text name
    text pill_item_seq FK "nullable"
    text memo
    timestamptz created_at
  }
  allergies {
    bigserial id PK
    bigint profile_id FK
    bigint allergen_id FK "nullable"
    text name
    text memo
    timestamptz created_at
  }
  allergens {
    bigserial id PK
    text name UK "성분명"
  }
  pill_allergens {
    bigserial id PK
    text pill_item_seq FK
    bigint allergen_id FK
  }
  pills {
    text item_seq PK "품목기준코드"
    text item_name
    text entp_name
    boolean is_otc
    text shape
    text color
    text mark_code "각인"
    text form_line "분할선"
    text image_url "식약처 제공 사진"
    text efcy "효능"
    text use_method "용법"
    text caution "주의/DUR"
    jsonb raw_json
    timestamptz fetched_at
  }
  scans {
    bigserial id PK
    bigint user_id FK
    jsonb vision_attrs "각인/색/모양/분할선"
    text matched_item_seq FK "nullable"
    real confidence
    text status "matched|ambiguous|failed"
    timestamptz created_at
  }
  conversations {
    bigserial id PK
    bigint user_id FK
    bigint profile_id FK "nullable"
    text pill_item_seq FK "약 정본(nullable)"
    bigint scan_id FK "출처/provenance"
    text summary "한 줄 요약"
    timestamptz created_at
    timestamptz updated_at
  }
  messages {
    bigserial id PK
    bigint conversation_id FK
    text role "user|assistant|system"
    text content
    timestamptz created_at
  }
  symptom_queries {
    bigserial id PK
    bigint user_id FK
    bigint profile_id FK "nullable"
    text symptom_text
    jsonb result "추천 OTC 목록(원본)"
    timestamptz created_at
  }
  symptom_recommendations {
    bigserial id PK
    bigint symptom_query_id FK
    text item_name "추천 약명(스냅샷)"
    text pill_item_seq FK "nullable"
    int rank
    text reason
  }
```

## 테이블 정의 (DDL 스타일)

```sql
users
  id            bigserial PK
  email         text UNIQUE NOT NULL
  password_hash text NOT NULL            -- 프로토타입: 미사용(시드 dev 유저)
  nickname      text
  created_at    timestamptz DEFAULT now()

health_profiles                          -- users 1:1
  id               bigserial PK
  user_id          bigint FK->users UNIQUE NOT NULL
  birth_year       int                   -- 필수
  sex              text                  -- 필수, CHECK 'M' | 'F' | 'other'
  is_pregnant      boolean DEFAULT false -- 필수
  is_breastfeeding boolean DEFAULT false -- 필수
  blood_pressure   text                  -- 선택, 예 '120/80'
  medical_history  text                  -- 선택, 병력(자유 입력)
  bmi              numeric               -- 선택
  updated_at       timestamptz DEFAULT now()

medications                              -- health_profiles 1:N (복용약)
  id            bigserial PK
  profile_id    bigint FK->health_profiles NOT NULL
  name          text NOT NULL
  pill_item_seq text FK?->pills          -- 식별되면 연결
  memo          text
  created_at    timestamptz DEFAULT now()

allergies                                -- health_profiles 1:N (사용자 알레르기)
  id          bigserial PK
  profile_id  bigint FK->health_profiles NOT NULL
  allergen_id bigint FK?->allergens       -- 성분 마스터 매칭(자유입력 미매칭 시 null)
  name        text NOT NULL              -- 사용자가 입력한 원문(표시용)
  memo        text
  created_at  timestamptz DEFAULT now()

allergens                                -- 알레르기 유발 성분 마스터
  id   bigserial PK
  name text UNIQUE NOT NULL              -- 성분명 (예: 페니실린, 아스피린)

pill_allergens                           -- pills M:N allergens (약이 포함하는 성분)
  id            bigserial PK
  pill_item_seq text FK?->pills NOT NULL   -- pills는 외부 캐시 → 논리참조
  allergen_id   bigint FK->allergens NOT NULL
  -- UNIQUE(pill_item_seq, allergen_id)

pills                                    -- 식약처 3종 API 캐시
  item_seq    text PK                    -- 품목기준코드
  item_name   text NOT NULL
  entp_name   text                       -- 업체
  is_otc      boolean                    -- OTC/ETC
  shape       text
  color       text
  mark_code   text                       -- 각인
  form_line   text                       -- 분할선
  image_url   text                       -- 식약처 제공 약 사진(우리 촬영본 아님)
  efcy        text                       -- e약은요 효능
  use_method  text                       -- 용법
  caution     text                       -- 주의(DUR 포함)
  raw_json    jsonb
  fetched_at  timestamptz DEFAULT now()

scans                                    -- 인식 (촬영본 미저장)
  id               bigserial PK
  user_id          bigint FK->users NOT NULL
  vision_attrs     jsonb                 -- 비전 LLM 추출(mark_code/color/shape/form_line)
  matched_item_seq text FK?->pills
  confidence       real                  -- 0~1 매칭 신뢰도
  status           text                  -- CHECK 'matched' | 'ambiguous' | 'failed'
  created_at       timestamptz DEFAULT now()

conversations                            -- 대화 세션 (약 1건당 N개 가능)
  id            bigserial PK
  user_id       bigint FK->users NOT NULL
  profile_id    bigint FK?->health_profiles -- 대화 시 참고한 건강정보
  pill_item_seq text FK?->pills            -- 약 정본 참조 (scan 생성 시 matched_item_seq 복사)
  scan_id       bigint FK?->scans        -- 출처 기록용(provenance), 약 도출엔 미사용
  summary       text                     -- 한 줄 요약 (목록에 표시)
  created_at    timestamptz DEFAULT now()
  updated_at    timestamptz DEFAULT now()

messages                                 -- conversations 1:N (세션 안 말풍선)
  id              bigserial PK
  conversation_id bigint FK->conversations NOT NULL
  role            text NOT NULL          -- CHECK 'user' | 'assistant' | 'system'
  content         text NOT NULL
  created_at      timestamptz DEFAULT now()

symptom_queries                          -- 증상별 추천 로그 (독립 원샷)
  id              bigserial PK
  user_id         bigint FK->users NOT NULL
  profile_id      bigint FK?->health_profiles  -- 추천에 반영한 건강정보
  symptom_text    text NOT NULL
  result          jsonb                  -- 추천 OTC 목록(LLM 원본 보관)
  created_at      timestamptz DEFAULT now()

symptom_recommendations                  -- 추천된 약 (symptom_queries 1:N)
  id               bigserial PK
  symptom_query_id bigint FK->symptom_queries NOT NULL
  item_name        text NOT NULL         -- 추천 약명 스냅샷(캐시에 없어도 보존)
  pill_item_seq    text FK?->pills        -- 논리참조, nullable (pills 캐시에 있으면 상세 연결)
  rank             int                   -- 추천 순위
  reason           text                  -- 추천 이유(짧게)
  -- UNIQUE(symptom_query_id, COALESCE(pill_item_seq, item_name))
```

## 관계 요약

| 관계 | 카디널리티 | 비고 |
|---|---|---|
| users — health_profiles | 1 : 0..1 | 온보딩 완료 시 1개 |
| health_profiles — medications | 1 : N | 복용약 목록 |
| health_profiles — allergies | 1 : N | 알레르기 목록 |
| users — scans | 1 : N | 인식 기록 |
| users — conversations | 1 : N | 대화 세션 |
| users — symptom_queries | 1 : N | 증상 추천 이력 |
| scans — conversations | 1 : 0..1 | 인식 성공 시 세션 자동 생성 |
| conversations — messages | 1 : N | 세션 안 말풍선 |
| pills — scans | 1 : N | `matched_item_seq` (nullable) |
| pills — conversations | 1 : N | `pill_item_seq` (nullable) |
| pills — medications | 1 : N | `pill_item_seq` (nullable, 선택 연결) |
| **allergens — allergies** | 1 : N | `allergen_id` (nullable) — 사용자 알레르기가 성분 마스터 참조 |
| **allergens — pill_allergens** | 1 : N | 약이 포함하는 성분 |
| **pills — pill_allergens** | 1 : N | 약↔성분 M:N(중간표) → "못 먹는 약" 판정 |
| **health_profiles — symptom_queries** | 1 : N | `profile_id` (nullable) — 추천에 건강정보 반영 |
| **health_profiles — conversations** | 1 : N | `profile_id` (nullable) — 대화 시 건강정보 참고 |
| **symptom_queries — symptom_recommendations** | 1 : N | 추천된 약 목록 |
| **pills — symptom_recommendations** | 1 : 0..N | `pill_item_seq` (nullable) — 캐시에 있으면 연결 |

## 설계 메모

- **인식 실패 허용**: `scans.status`로 `matched|ambiguous|failed` 구분. 실패해도 `matched_item_seq`는 null로 row 보존 → 재시도/분석.
- **세션 자동 생성**: PLAN의 "인식 성공 대화는 기록에 자동 저장" → `scan` 1건이 `conversation` 1개를 생성(`scan_id`). 대화는 인식 없이도 존재 가능하게 nullable. 한 약에 세션 여러 개 가능(재질문 = `scan_id` 없는 새 세션).
- **한 줄 요약**: `conversations.summary`는 대화를 한 줄로 압축한 요약. 세션 목록에 `summary` + `updated_at`으로 표시. (v1.0의 `summaries` 버전 누적 테이블은 제거 — 한 줄 요약으로 단순화.)
- **약(pills) 참조 — 정본 규칙 (v1.3)**: `matched_item_seq`·`pill_item_seq`는 외부 캐시 `pills`를 가리키는 cross-domain 참조 → DB FK가 아니라 **논리 ID 참조**. **대화 세션의 약은 항상 `conversations.pill_item_seq`가 정본**이고, `scan`에서 생성될 때 `scan.matched_item_seq`를 이 컬럼에 복사한다. `scan_id`는 "어느 인식에서 시작됐는지" **출처 기록용일 뿐, 약을 도출하는 데 쓰지 않는다**(이중 도출 제거).
- **pills 캐시**: 외부 API 원본은 `raw_json`(jsonb)에 통째로 보관, 자주 쓰는 필드만 컬럼으로 승격. `fetched_at`으로 갱신 시점 추적.
- **알레르기 ↔ 약 매칭(v1.2)**: 알레르기 유발 성분을 마스터 `allergens`로 정규화하고, 약↔성분은 `pill_allergens`(M:N) 중간표로 표현. 판정은 `allergies.allergen_id`(사용자) ∩ `pill_allergens.allergen_id`(약) 교집합 — 하나라도 겹치면 **못 먹는 약**. `allergies.name`은 사용자 입력 원문(표시용)으로 남기고, 마스터에 매칭되면 `allergen_id`로 정확 판정, 미매칭이면 null(표시만).
- **약 ↔ 증상추천 매칭(v1.2 · v1.3 보정)**: LLM 추천 원본은 `symptom_queries.result`(jsonb)에 보관. 추천 약은 `symptom_recommendations`에 **`item_name` 스냅샷으로 항상 남기고**, `pills` 캐시에 있으면 `pill_item_seq`(nullable, 논리참조)로 연결해 약 상세(효능·주의)로 들어간다. 캐시에 없어도 추천 행은 보존. `rank`/`reason`으로 순위·이유 보관.
- **증상추천은 독립 원샷(v1.3)**: `symptom_queries`는 '기타→증상별 추천' 화면에서 들어가는 **독립 플로우**로, 대화 세션과 무관하다. 입력은 `symptom_text` + `profile_id`(건강정보, nullable — 미입력 사용자도 추천 가능). *v1.2의 `conversation_id`는 실제 사용 화면이 없어 제거.*
- **대화세션의 건강정보 참고(v1.2)**: `conversations.profile_id`로 대화 시 참고한 건강정보를 연결(nullable). `user_id`로도 도출 가능하나, "이 대화가 어떤 건강정보 맥락에서 이뤄졌는지"를 명시적으로 남겨 추후 프로필 변경과 무관하게 추적.
- **제약·표기 일관화 (v1.3)**: 외부 캐시 `pills`를 가리키는 모든 참조는 논리참조(`FK?`)로 통일(DB FK 미설정, 무결성은 앱에서 보장). enum류는 CHECK로 — `health_profiles.sex`(`M`|`F`|`other`)·`messages.role`(`user`|`assistant`|`system`)·`scans.status`(`matched`|`ambiguous`|`failed`). `health_profiles.updated_at`·`conversations.updated_at`은 변경 시 자동 갱신(트리거 또는 앱).
- **알레르기 매칭 데이터 소스 — 확인 필요 (v1.3)**: `pill_allergens`(약↔성분)를 채우려면 **약별 성분 구조화 데이터**가 필요한데, 현재 선택한 3종 API(낱알식별·DUR·e약은요)에서 깔끔히 제공되는지 미확인. "못 먹는 약 판정"의 실현 전제 → 별도 성분/허가 정보 소스(예: 의약품 제품 허가정보) 확보 여부를 먼저 검증해야 한다. **스키마는 유지**하되 데이터 파이프라인은 선검증 대상.
