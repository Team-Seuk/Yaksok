/* 홈 = AI가 정리해주는 맞춤 대시보드 (스텁).
   상단 '오늘의 한마디'(LLM 한 줄)가 주인공, 그 아래 복약·이번 주 요약 카드.
   본격 대시보드(실데이터/통계)는 후속 스펙. 지금은 더미 + 건강정보로 가볍게 개인화. */
import { useNavigate } from 'react-router-dom'
import PillImage from '../../components/PillImage'
import { ChevronRight } from '../../components/icons'
import { loadHealth } from '../../lib/storage'
import styles from './HomePage.module.css'

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
  const meds = loadHealth()?.medications ?? []
  if (meds.length > 0) {
    const slots = ['아침', '점심', '저녁']
    return meds.slice(0, 3).map((m, i) => ({ name: m.name, time: slots[i] ?? '수시', taken: i === 0 }))
  }
  return [
    { name: '타이레놀정 500mg', time: '아침', taken: true },
    { name: '이지엔6프로', time: '점심', taken: false },
  ]
}

export default function HomePage() {
  const navigate = useNavigate()
  const doses = buildDoses()
  const takenCount = doses.filter((d) => d.taken).length

  return (
    <div className={styles.home}>
      <header className={styles.greeting}>
        <p className={styles.date}>{todayLabel()}</p>
        <h1 className={styles.greetingTitle}>오늘도 안녕하세요</h1>
      </header>

      {/* 시그니처 — 오늘의 한마디 (LLM 한 줄) */}
      <section className={styles.spotlight} aria-labelledby="home-spotlight">
        <div className={styles.spotlightHead}>
          <span className={styles.spotlightDot} aria-hidden="true" />
          <span id="home-spotlight" className={styles.spotlightLabel}>오늘의 한마디</span>
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
      <section className={`card ${styles.block}`} aria-labelledby="home-dose">
        <div className={styles.blockHead}>
          <h2 id="home-dose" className={styles.blockTitle}>오늘의 복약</h2>
          <span className={styles.blockMeta}>
            {takenCount}/{doses.length} 챙김
          </span>
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
        <div className={styles.stat}>
          <span className={styles.statNum}>80%</span>
          <span className={styles.statSub}>목표 달성 중</span>
          <span className={styles.statLabel}>이번 주 복약률</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>3</span>
          <span className={styles.statSub}>이번 주</span>
          <span className={styles.statLabel}>새로 찾아본 약</span>
        </div>
      </section>

      <p className={styles.note}>맞춤 정보와 통계는 사용할수록 더 정확해져요.</p>
    </div>
  )
}
