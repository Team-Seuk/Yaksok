/* 홈 = AI가 정리해주는 맞춤 대시보드 (스텁).
   상단 '오늘의 한마디'(LLM 한 줄)가 주인공, 그 아래 복약·이번 주 요약 카드.
   본격 대시보드(실데이터/통계)는 후속 스펙. 지금은 더미 + 건강정보로 가볍게 개인화. */
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PillImage from '../../components/PillImage'
import { ChevronRight } from '../../components/icons'
import { loadMedications } from '../../lib/storage'
import { SplashReadyContext } from '../../lib/splash'
import styles from './HomePage.module.css'

/* 편집 버튼 아이콘 — icons.tsx는 건드리지 않고 인라인(연필). */
function PencilGlyph() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  )
}

/* 이번 주 복약률(%) — 실데이터 연결 지점(현재 더미). 값만 바꾸면 그래프가 그에 맞게 찬다. */
const ADHERENCE = 80

/* 복약률 원형 그래프 — 홈 진입마다 0에서 현재 수치까지 차오른다(reduced-motion이면 즉시).
   첫 로드 시엔 스플래시가 끝나 홈이 실제로 보일 때(ready) 시작해, 애니메이션이 가려진 채 끝나지 않게 한다. */
function AdherenceRing({ percent }: { percent: number }) {
  const ready = useContext(SplashReadyContext)
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const [shown, setShown] = useState(reduce ? percent : 0)
  useEffect(() => {
    if (reduce || !ready) return
    let raf = 0
    let start = 0
    const dur = 900
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / dur)
      setShown(Math.round(percent * ease(p)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [percent, reduce, ready])
  const r = 34
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - shown / 100)
  return (
    <svg viewBox="0 0 80 80" className={styles.ring} role="img" aria-label={`이번 주 복약률 ${percent}퍼센트`}>
      <circle className={styles.ringTrack} cx="40" cy="40" r={r} />
      <circle
        className={styles.ringFill}
        cx="40"
        cy="40"
        r={r}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
      />
      <text className={styles.ringText} x="40" y="40">
        {shown}%
      </text>
    </svg>
  )
}

/* 최근 대화 — 마지막 세션을 한 줄로 요약(프로토타입: 더미). 실제론 LLM이 세션 종료 시 생성. */
const RECENT_CHAT = {
  when: '어제',
  summary:
    '이지엔6프로를 빈속에 먹어도 되는지 물어봤고, 위가 예민하면 식후 30분 복용을 권하며 야간 복용 시 가벼운 음식과 함께 들라고 안내했어요.',
}

/* 오늘 날짜 — "6월 22일 일요일" */
function todayLabel(): string {
  try {
    return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(
      new Date(),
    )
  } catch {
    return '오늘'
  }
}

/* 복용 중인 약을 칩으로 (없으면 더미). 프로토타입이라 복약 시점은 더미 상태. */
type Dose = { name: string; time: string; taken: boolean }
function buildDoses(): Dose[] {
  const slots = ['아침', '점심', '저녁']
  return loadMedications()
    .slice(0, 3)
    .map((m, i) => ({ name: m.name, time: m.when ?? slots[i] ?? '수시', taken: i === 0 }))
}

export default function HomePage() {
  const navigate = useNavigate()
  const doses = buildDoses()
  const takenCount = doses.filter((d) => d.taken).length

  return (
    <div className={styles.home}>
      <header className={styles.greeting}>
        <p className={styles.date}>{todayLabel()}</p>
        <h1 className={styles.greetingTitle}>오늘도 건강하세요</h1>
      </header>

      {/* 시그니처 — 오늘의 한마디 (LLM 한 줄) */}
      <section className={styles.spotlight} aria-labelledby="home-spotlight">
        <div className={styles.spotlightHead}>
          <span className={styles.spotlightDot} aria-hidden="true" />
          <span id="home-spotlight" className={styles.spotlightLabel}>약속의 한마디</span>
        </div>
        <p className={styles.spotlightBody}>
          오후엔 수분을 충분히 드세요. 지금 복용 중인 약은 공복 자극이 적은 편이라 식후가 아니어도 괜찮아요.
        </p>
      </section>

      {/* 최근 대화 — 마지막 세션 한 줄 요약 */}
      <button className={styles.recent} onClick={() => navigate('/chat')} aria-label="최근 대화 이어보기">
        <div className={styles.recentHead}>
          <span className={styles.recentLabel}>최근 대화</span>
          <span className={styles.recentWhen}>{RECENT_CHAT.when}</span>
        </div>
        <p className={styles.recentBody}>{RECENT_CHAT.summary}</p>
        <span className={styles.recentMore}>
          대화 이어보기
          <ChevronRight size={16} />
        </span>
      </button>

      {/* 오늘의 복약 */}
      <section className={`card ${styles.block}`} aria-labelledby="home-dose" style={{ viewTransitionName: 'today-card' }}>
        <div className={styles.blockHead}>
          <h2 id="home-dose" className={styles.blockTitle}>오늘의 약속 💊</h2>
          <div className={styles.blockActions}>
            <span className={styles.blockMeta}>
              {takenCount}/{doses.length} 챙김
            </span>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => navigate('/today', { viewTransition: true })}
              aria-label="오늘의 약속 편집"
            >
              <PencilGlyph />
              편집
            </button>
          </div>
        </div>
        <ul className={styles.doseList}>
          {doses.map((d) => (
            <li key={d.name} className={styles.doseItem}>
              <span className={styles.doseThumb} aria-hidden="true">
                <PillImage
                  look={
                    d.taken
                      ? { kind: 'capsule', color: 'var(--accent)', color2: 'var(--bg-elev)' }
                      : { kind: 'capsule', color: 'var(--border-strong)', color2: 'var(--bg-elev-2)' }
                  }
                  size={46}
                />
              </span>
              <span className={styles.doseBody}>
                <span className={styles.doseName}>{d.name}</span>
                <span className={styles.doseTime}>{d.time}</span>
              </span>
              <span className={`${styles.doseState}${d.taken ? ` ${styles.doseStateOn}` : ''}`}>
                {d.taken ? '복용함' : '예정'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 이번 주 요약 */}
      <section className={styles.stats} aria-label="이번 주 요약">
        <div className={`${styles.stat} ${styles.statRing}`}>
          <AdherenceRing percent={ADHERENCE} />
          <span className={styles.statLabel}>이번 주 복약률</span>
        </div>
        <div className={`${styles.stat} ${styles.statCount}`}>
          <span className={styles.statCountText}>
            <span className={styles.statSub}>이번 주</span>
            <span className={styles.statLabel}>새로 찾아본 약</span>
          </span>
          <span className={styles.statNum}>3</span>
        </div>
      </section>

      <p className={styles.note}>맞춤 정보와 통계는 사용할수록 더 정확해져요.</p>
    </div>
  )
}
