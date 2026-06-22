# Yaksok — 프론트엔드 대개편 스펙 (M1)

> 날짜: 2026-06-22 · 상태: **구현 완료 (typecheck·lint·build 그린, 실렌더 검증). `feat/design-overhaul` 브랜치 — 리뷰/머지 대기** · 마일스톤: **M1 (디자인 토큰/시그니처 확정)**
> 디자인 지침: 상위 팀 [`../../DESIGN.md`](../../DESIGN.md) (`C:\Team-Seuk\DESIGN.md`). 본 문서는 그 지침의 `1. 프로젝트 결정`을 Yaksok 앱에 적용한 결과 + 실행 계획.

## 0. 목표 한 줄

민트/라이트/Pretendard **정체성은 유지·정제**하면서, ① 토큰 시스템 완성(하드코딩 제거) ② 라우터·네비게이션 재설계 ③ 알약 일러스트 시그니처 확립 ④ 상태 화면 정비로, 현재 6화면 프로토타입을 **M1 완성 수준**으로 끌어올린다.

---

## 1. 확정 정체성 (DESIGN.md `1. 프로젝트 결정` — 앱 레벨)

```yaml
subject: 알약을 비추면 개인 건강정보·현재 시각에 맞춰 복약 안내를 주는 모바일 웹앱
audience: 복약 정보를 빠르게·안심하고 확인하려는 일반 사용자 + 고령층
job:     핵심 "촬영→안내 확인", 보조 "기록 열람·증상별 추천" (화면별 단일 목표)

mood:      다정한 / 부드러운 / 안심되는
refs:      토스(Toss) · Headspace · Flo
signature: 알약 일러스트 시스템 — 모양·색·각인·분할선을 실제처럼 그리는
           일관된 알약 비주얼을 홈·기록·결과·추천 전반의 브랜드 결로

palette:                       # theme.css 유지·정제
  bg:      "#eef2f3"           # --bg (오프화이트)
  surface: "#ffffff"           # --bg-elev
  text:    "#16201f"           # --text
  accent:  "#0fae97"           # --accent (민트, 화면당 1개)
theme:     light               # 다크는 범위 밖(추후)

type:
  display: Pretendard          # 헤드라인, 두께로 위계
  body:    Pretendard          # 본문 16px+ (고령 고려)
  mono:    tabular-nums        # 용량·시각 숫자 정렬

motion:    medium              # 부드러운 ease, 160~400ms
density:   airy                # 다정·고령 배려 — DESIGN 기본 balanced보다 한 단계 위
```

---

## 2. 범위

**포함**
- 토큰 시스템 완성: 간격·타이포·모션·z-index 토큰 신설 + 기존 하드코딩 전부 토큰화.
- 라우터 도입(`react-router-dom`): `App.tsx`의 `useState` 화면 전환 제거 → URL 기반.
- 네비게이션 재설계: 하단 탭바·정보구조·레이블·아이콘 재정비.
- 개별 대화 화면 신설: 세션→메시지 말풍선 + 입력(composer).
- 상태 화면 정비: 권한거부·인식실패·빈 기록·로딩·에러.
- 시그니처 확립: 알약 일러스트 시스템(`PillImage`) 확장 후 전 화면 적용.
- 6화면 전면 폴리시.

**제외**
- 다크 테마(추후).
- 백엔드·공공 API·LLM 실연동(M2~M5).
- 인증/서버 영속화(프로토타입은 localStorage 유지).
- 새 비즈니스 기능(범위는 현 6화면 + 개별 대화 화면).

---

## 3. 단계별 계획 (의존 순서)

| Phase | 내용 | 파일/영역 | 팀 PR(위험도) |
|---|---|---|---|
| **0 준비** | `feat/design-overhaul` 브랜치 생성, `react-router-dom` 의존성 도입 | `package.json` | 위험구역 → PL+PO |
| **1 토큰 기반** | `theme.css`에 `--sp-*`·`--fs-*/--fw-*/--font-*`·`--duration-*/--ease-*`·z-index 스케일 신설, 기존 하드코딩(24px·13px·11.5px·12.5px·9px·버튼 그라데이션 등) 전부 토큰화. 라이트 유지 | `styles/theme.css` | 위험구역 → PL+PO |
| **2 셸·공통·라우터** | 라우터로 전환(`App.tsx` useState 제거), 네비 재설계, 공통 컴포넌트 토큰화(Button/Card/Field/Badge/Bubble/TabBar) + 신규 상태 컴포넌트(EmptyState·Loading·ErrorState) | `App.tsx`, `components/`, `main.tsx` | 위험구역 → PL+PO |
| **3 화면 폴리시(병렬)** | home·cabinet·result·more·profile·symptom 6화면 재작업 | `pages/*` | 일반 → 1인 승인 |
| **4 시그니처** | 알약 일러스트 시스템: `PillImage` 확장(모양·색·각인·분할선·사이즈 토큰) → 전 화면 적용 | `components/PillImage.tsx` | 위험구역(공용) → PL+PO |
| **5 상태 화면** | 권한거부·인식실패·빈 기록·로딩·에러를 일관 디자인으로 화면에 배선 | `pages/*`, `components/` | 혼합 |
| **6 마감** | 배포 전 체크리스트 통과, 문서 정합(PLAN 죽은 경로 수정, HANDOFF/LOG 갱신) | `docs/`, `PLAN.md`, `HANDOFF.md`, `LOG.md` | 위험구역(문서) → PL+PO |

**병렬 전략**: Phase 1·2(토큰·셸)가 머지된 **뒤**, Phase 3의 6화면 + Phase 4 일러스트를 병렬 에이전트로 동시에 진행(`frontend-design` 스킬 사용). DESIGN.md "병렬 적극 활용"에 부합.

---

## 4. 화면별 스코프

| 화면 | 파일 | 개편 포인트 |
|---|---|---|
| 홈(카메라) | `pages/home/HomePage.tsx` | 뷰파인더를 다정한 결로, 캡처/인식 상태 흐름, **권한 거부 상태** 배선 |
| 알약사전(기록) | `pages/cabinet/CabinetPage.tsx` | 알약 일러스트 썸네일 일관 적용, **빈 기록 상태**, 저장소 데이터 연결 |
| 결과(대화) | `pages/result/ResultPage.tsx` + **신규** `ConversationPage` | 약 카드+요약+세션 목록 정제, **개별 대화 화면 신설**(말풍선+composer), 안전 정보(주의사항) 가독성 최우선 |
| 기타(메뉴) | `pages/more/MorePage.tsx` | 메뉴 항목·아이콘·진입 정제 |
| 내 정보 | `pages/profile/ProfilePage.tsx` | 온보딩/입력 폼 접근성(라벨·에러 연결), airy 간격 |
| 증상별 추천 | `pages/symptom/SymptomPage.tsx` | 추천 카드 + **면책 문구 명료화**, 빈/로딩 상태 |

---

## 5. 신규 토큰 명세 (Phase 1)

기존 `theme.css`는 색 + `--radius`만 토큰. 아래를 추가하고 모든 하드코딩 값을 치환한다.

```css
/* 간격 — 4px 기반 */
--sp-xs:4px; --sp-sm:8px; --sp-md:16px; --sp-lg:24px;
--sp-xl:32px; --sp-2xl:48px; --sp-3xl:64px;

/* 타이포 */
--fs-h1:clamp(24px,6vw,32px); --fs-h2:20px; --fs-body:16px; --fs-sm:14px; --fs-cap:13px;
--fw-regular:450; --fw-medium:550; --fw-semibold:650; --fw-bold:800;
--font-sans:'Pretendard Variable',...; --font-mono:...tabular-nums;

/* 모션 */
--duration-fast:160ms; --duration-normal:320ms;
--ease-out:cubic-bezier(.2,.7,.2,1); --ease-spring:cubic-bezier(.34,1.56,.64,1);

/* z-index 고정 스케일 */
--z-base:0; --z-tabbar:100; --z-overlay:200; --z-modal:300; --z-toast:400;

/* 반경 스케일 */
--radius-sm:10px; --radius:16px; --radius-lg:18px; --radius-pill:999px;
```

> 본문 최소 16px(고령 고려로 상향), `prefers-reduced-motion` 대응, 강조색 화면당 1개 — DESIGN.md `3. 불변 원칙` 준수.

---

## 6. 팀 PR 매핑 (위험도 기반 — CONTRIBUTING/CODEOWNERS)

- **위험 공용구역**(`theme.css`·공용 `components/`·`package.json` 의존성·`api/`·설정·`docs/`): @suvisdev(PL) + @bestcow(PO) 2인 승인 필요.
- **일반 기능 파일**(`pages/*` 개별 화면): 오너 미지정 → 팀원 아무나 1인 승인.
- PO(@bestcow)는 `always`-bypass 보유(전권).
- `main` 직접 작업 금지. 각 Phase = 별도 `feat/*` 브랜치 → PR → CI 그린 → 머지.

---

## 7. 검증 (단계마다 + CI)

```
cd frontend && npm run typecheck && npm run lint && npm run build
```
CI `.github/workflows/check.yml`의 `frontend` 잡과 동일. 통과해야 머지.

배포 전(Phase 6)에 DESIGN.md `6. 배포 전 체크리스트` 전 항목 점검:
- [ ] 색·간격·폰트·모션 전부 토큰 (하드코딩 0)
- [ ] 본문 16px+, 대비 4.5:1+, 한 줄 75자 이하
- [ ] 320px 폭에서 안 깨짐
- [ ] Tab 도달 + 포커스 보임, 다이얼로그 포커스 트랩/복원
- [ ] `prefers-reduced-motion` 대응, 모션 transform/opacity 위주
- [ ] signature(알약 일러스트) 실제 구현
- [ ] 안전 정보(주의사항·경고)가 장식에 안 묻힘

---

## 8. 결정 사항 / 리스크

1. **라우터**: `react-router-dom` 신규 의존성 도입(위험구역 PR). 경량 자작 라우터 대안은 비추 — 표준 채택.
2. **다크 테마**: 과거 다크→라이트 의도적 전환 이력 → **범위 밖(추후)** 확정.
3. **문서 정합**: `PLAN.md`의 죽은 경로 `C:\dev\docs\web-design` → `C:\Team-Seuk\DESIGN.md`로 수정(Phase 6).

---

## 9. 산출물

- 완성된 토큰 시스템(`theme.css`), 라우터 기반 셸, 공통 컴포넌트 세트, 알약 일러스트 시스템, 6+1화면, 상태 화면.
- 갱신된 `PLAN.md`(경로 정합, M1 완료 표기)·`HANDOFF.md`·`LOG.md`.
