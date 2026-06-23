# Yaksok — Figma 재구성 가이드

> 코드로 존재하는 프론트엔드를 Figma로 시스템화하기 위한 토큰 매핑 + 화면별 프롬프트.
> 정책: 상위 [DESIGN.md](../../DESIGN.md) §0.5 · 툴 로그 [DESIGN-TOOLS.md](../../DESIGN-TOOLS.md).
>
> **2026-06-23 갱신 — 5탭 IA 개편 반영.** 하단 탭바가 `알약사전 · 카메라 · 홈 · 대화 · 기타`(홈 가운데) 5탭으로 바뀜. 기존 `홈=카메라`가 **카메라 탭으로 분리**되고, `홈`은 **AI 맞춤 대시보드**(신규), `대화`는 **독립 빈 채팅**(신규)이 됨. `내 기록`→`알약사전` 리브랜딩. 인트로는 3D 회전 알약 → **캡슐→약속 모프**로 교체(three.js 의존성 제거). 홈·대화·인트로는 Figma Make로 시안을 뽑아 우리 토큰 시스템으로 포팅 적용 완료.

## 0. 원칙 (먼저 읽기)
- **한 파일, 페이지 분리**: `Foundations`(Variables/Styles) · `Components` · `Screens`. **기반 먼저 → 화면은 부품 조합**(화면마다 새로 프롬프트 X → 일관성 깨짐).
- **이미 코드가 있다 → 빠른 경로 우선**: `html.to.design` 플러그인으로 돌아가는 `localhost:5180`을 편집 가능한 레이어로 임포트 → Variables/컴포넌트로 정리. AI 텍스트→디자인(First Draft / Figma Make)은 **변형 탐색용**으로만.
- **폰 프레임 1규격 고정**: **440 × 932** (우리 앱 셸 440 폭 기준).
- 생성물은 반드시 §2 금지·§3 불변 원칙 통과(민트 1개·하드코딩 0·접근성·Tailwind룩 금지).

---

## 1. Figma Variables / Styles 매핑 (`theme.css` → Figma)

### 1.1 Color — Variable collection `color`
| theme.css | Figma 변수 | 값 |
|---|---|---|
| `--bg` | `color/bg` | #EEF2F3 |
| `--bg-elev` | `color/bg-elev` | #FFFFFF |
| `--bg-elev-2` | `color/bg-elev-2` | #E7EDEE |
| `--border` | `color/border` | #DDE4E6 |
| `--border-strong` | `color/border-strong` | #C4CED0 |
| `--text` | `color/text` | #16201F |
| `--text-dim` | `color/text-dim` | #5D6B6C |
| `--text-faint` | `color/text-faint` | #93A0A0 |
| `--accent` | `color/accent` | #0FAE97 |
| `--accent-deep` | `color/accent-deep` | #0B8F7C |
| `--accent-soft` | `color/accent-soft` | #0FAE97 · 12% |
| `--accent-line` | `color/accent-line` | #0FAE97 · 30% |
| `--accent-fog` | `color/accent-fog` | #0FAE97 · 8% |
| `--warn` | `color/warn` | #B45309 |
| `--warn-soft` | `color/warn-soft` | #B45309 · 10% |
| `--warn-line` | `color/warn-line` | #B45309 · 28% |

> 강조색은 **화면당 민트 1개** 유지. warn은 안전정보(주의) 전용.

### 1.2 Number — collection `space` / `radius`
| 토큰 | Figma 변수 | px |
|---|---|---|
| `--sp-xs … --sp-3xl` | `space/xs,sm,md,lg,xl,2xl,3xl` | 4 · 8 · 16 · 24 · 32 · 48 · 64 |
| `--radius-sm / --radius / --radius-lg / --radius-pill` | `radius/sm,md,lg,pill` | 10 · 16 · 18 · 999 |

### 1.3 Text Styles (Pretendard — `font/sans`)
| 토큰 | Text Style | size / weight / line-height |
|---|---|---|
| `--fs-display` | `Display` | 26 · Bold(800) · 1.2 |
| `--fs-h1` | `H1` | 22 · Bold(800) · 1.2 |
| `--fs-h2` | `H2` | 18 · Bold(800) · 1.4 |
| `--fs-lg` | `Body-lg` | 17 · Semibold(650) · 1.4 |
| `--fs-body` | `Body` | 16 · Regular(450) · 1.65 |
| `--fs-sm` | `Body-sm` | 15 · Regular(450) · 1.4 |
| `--fs-cap` | `Caption` | 13 · Semibold(650) · 1.4 |
| `--fs-xs` | `Caption-xs` | 12 · Medium(550) · 1.4 |

> 숫자(용량·시각·통계)는 `tabular-nums` 적용.

### 1.4 Effect Styles (그림자 — 약하게)
| 토큰 | Effect Style | 값 |
|---|---|---|
| `--shadow-card` | `Elevation/card` | 0 2 10 #14282 6·5% + 0 1 2 #142826·4% |
| `--shadow-pop` | `Elevation/pop` | 0 10 30 #142826·10% |

### 1.5 Motion (Figma 변수 아님 — 프로토타입 Smart Animate에 수동 적용)
- `--duration-fast` 160ms · `--duration-normal` 320ms
- `--ease-out` = cubic-bezier(.2,.7,.2,1) · `--ease-spring` = cubic-bezier(.34,1.56,.64,1)
- 탭 전환은 좌우 슬라이드(알약사전◀카메라◀홈▶대화▶기타 순서), 등장은 ease-out 160~400ms, `reduced-motion` 고려.

---

## 2. 공통 STYLE 프리앰블 (모든 화면 프롬프트 앞에 붙일 것)

```
STYLE: Mobile UI, 440px wide (frame 440×932). Korean medication-guidance app "약속".
Light theme — background #EEF2F3, surfaces #FFFFFF, text #16201F. Single mint accent #0FAE97
(deep #0B8F7C). Font: Pretendard. Soft rounded cards (radius 16), very subtle elevation,
airy spacing (4px scale: 8/16/24). Mood: warm, gentle, reassuring (다정·부드러운·안심).
Safety/caution info in an amber "warn" box (#B45309 on #B4530910) with an alert icon + label.
Body text 16px+. NO purple/blue gradients, NO generic Tailwind/shadcn look, NO emoji bullets,
single accent only, 44px touch targets, visible focus.
```

---

## 3. 화면별 프롬프트 (STYLE + 아래 본문을 함께 붙여넣기)

**Splash (인트로 — 캡슐→약속 모프)**
```
앱 진입 인트로. #EEF2F3 + 중앙 민트 fog. 가로 캡슐(좌 민트/우 화이트+분할선, 광택)이 ~1.8s 동안:
1) 페이드+스케일 인 → 2) 두 반쪽이 좌·우로 열리며 틈에서 민트 빛 → 3) 틈에서 "약속" 워드마크가
위로 차오름(상향 와이프), 부제 "잊지 않게, 안심하게" 페이드업 → 4) 정착 후 앱으로 페이드. 탭 스킵,
reduced-motion이면 단순 페이드. 2.5D(SVG/CSS). ("캡슐이 곧 약속이 되는" 서사)
```

**Home (대시보드 — 신규, 가운데 탭)**
```
AI 맞춤 대시보드. 상단 날짜줄 + 인사 "오늘도 안녕하세요". 시그니처 "오늘의 한마디" 카드(민트-soft
틴트 + 방사 글로우 + 맥동 점 + 라벨 + LLM 한 문장, 화면 유일 강조점). "오늘의 복약" 카드(알약
일러스트 썸네일+이름+시간+상태칩 복용함/예정). "이번 주 요약" 통계 타일 2개(80% 복약률 / 3 찾아본 약).
faint 푸터. 하단 탭바(알약사전·카메라·홈·대화·기타).
```

**Camera (카메라)**
```
알약 촬영. 중앙에 카메라 뷰파인더 카드(흰색, 라운드 24, 약한 그림자) — 네 모서리 민트 코너 브래킷 +
옅은 알약 실루엣 가이드. 캡션 "가운데 칸에 알약을 맞춰 주세요". 주 버튼(민트) "알약 촬영하기". 아래에
촬영 팁 카드(체크 불릿 3개). 하단 탭바(알약사전·카메라·홈·대화·기타). 상태: 대기/인식중/권한거부.
```

**Chat (대화모드 — 신규)**
```
빈 채팅에서 바로 묻는 독립 화면. 헤더 "대화" + "약속 도우미". 빈 상태(기본): 중앙 브랜드 아바타 +
"무엇이든 편하게 물어보세요" + 부제 + 예시 칩 3개. 활성: 사용자=오른쪽 민트 말풍선, 도우미=왼쪽 흰
카드(아바타). 하단 둥근 입력바 + 원형 민트 보내기. 하단 탭바(알약사전·카메라·홈·대화·기타).
```

**Cabinet (알약사전)**
```
복약 기록 목록. 맨 위 "이번 주 복약" 요약 카드 — 좌측 민트 원형 진행률 링(80%), 우측 "잘 지키고
있어요" + 통계("4건 기록 · 곧 챙길 약 1개"), 민트 워시 배경. 아래 기록 카드 리스트: 각 카드에 알약
일러스트 썸네일 + 약 이름 + 날짜 + 용법 + 주황 주의(warn) 박스 + "이어서 물어보기 ›". 하단 탭바.
```

**Result (약품 상세)**
```
약품 상세. 상단 뒤로가기. 히어로: 큰 알약 일러스트 + 약 이름 + 성분 배지 + 제조사 칩들(중앙 정렬,
흰 카드). "복약 요약" 섹션 — 용법/용량/복용시점을 아이콘+라벨 fact 카드로. "복용 주의" 섹션 —
주황 warn 박스에 방패 아이콘 + 불릿 주의사항. "대화 목록" — 민트 채움 "새 대화 시작하기" 카드 +
지난 질문 카드들(인용 아이콘).
```

**Conversation (개별 대화)**
```
약에 대한 채팅 화면. 상단 약 이름 + "이 약에 대한 대화". 안심 인트로 pill. 말풍선: 사용자=오른쪽
민트, 도우미=왼쪽 흰 카드(역할 라벨). 하단 고정 입력창(둥근) + 민트 보내기 버튼.
```

**Symptom (증상별 추천)**
```
증상 입력→OTC 추천. 입력 카드 "어디가 불편하세요?" + 증상 textarea + 빠른 증상 칩(두통·콧물 등) +
민트 "추천받기" 버튼. 추천 전 빈 상태(알약 일러스트 + 안내). 추천 후 약 카드 리스트. 하단에 주황
톤 면책 안내 카드("참고로 알아두세요 …").
```

**More (기타)**
```
메뉴 화면. 큰 제목 "기타". 메뉴 카드 2개(아이콘 타일+제목+설명+› chevron, 약한 그림자, 호버 리프트):
"내 정보 입력 / 나이·성별·복용약·알레르기 수정", "증상별 약 추천 / 증상을 입력하면 일반의약품을 추천".
```

**Profile (내 정보 / 온보딩)**
```
내 정보 입력(온보딩 겸용). 제목 + 민트 안심 배너("한 번만 입력하면 돼요"). 폼: 나이 input,
성별 세그먼트(여성/남성/기타), 임신·수유 세그먼트, 복용약 input, 알레르기 input. 주 버튼
"완료하고 시작하기" + "이 기기에만 저장돼요" 푸터. airy 간격, 큰 라벨(고령 배려).
```

---

## 4. 셋업 체크리스트
- [ ] 새 Figma 파일 + 페이지 3개(`Foundations` / `Components` / `Screens`)
- [ ] §1 매핑표대로 **Color/Number Variables + Text/Effect Styles** 생성
- [ ] (빠른 길) `html.to.design`로 `localhost:5180` 임포트 → 레이어 정리 (탭 5 + 약품상세·대화상세·내정보 + 인트로)
- [ ] 반복 요소를 **Component**로(Button·Card·기록카드·링카드·warn박스·5탭 TabBar·Input·Chip·StatTile·말풍선)
- [ ] `Screens`에서 컴포넌트 조합으로 화면 구성(440×932)
- [ ] 탭 전환/등장 모션을 프로토타입 Smart Animate로(§1.5)
- [ ] 부족한 변형만 Figma AI로 탐색 → 컴포넌트/Variables로 normalize
