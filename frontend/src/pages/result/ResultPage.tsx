import { useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, PlusIcon } from '../../components/icons'
import PillImage from '../../components/PillImage'
import { getPillById } from '../../lib/pillData'
import styles from './ResultPage.module.css'

/* 화면 내 인라인 SVG (icons.tsx 미보유 아이콘) */
function ClockIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4l2.6 1.6" />
    </svg>
  )
}
function DropIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5c3.5 4 6 6.7 6 10a6 6 0 0 1-12 0c0-3.3 2.5-6 6-10z" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
      <path d="M4 9.5h16M8.5 3.5v3.5M15.5 3.5v3.5" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5l7 2.5v5c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6z" />
      <path d="M9.3 12l1.9 1.9 3.5-3.8" />
    </svg>
  )
}
const FACT_ICONS = [<ClockIcon />, <DropIcon />, <CalendarIcon />]

export default function ResultPage({
  onBack,
  onNewSession,
}: {
  onBack: () => void
  onNewSession?: () => void
}) {
  const { id } = useParams()
  const pill = getPillById(Number(id))

  if (!pill) {
    return (
      <div className="result">
        <div className="topbar">
          <button className="iconbtn" onClick={onBack} aria-label="뒤로">
            <ChevronLeft />
          </button>
        </div>
        <div className="state">
          <p className="state-title">약을 찾을 수 없어요</p>
          <p className="state-desc">다시 시도해 주세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="result">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="뒤로">
          <ChevronLeft />
        </button>
      </div>

      <div className={`result-scroll ${styles.scroll}`}>
        {/* 약 카드 — 알약 일러스트를 시그니처로 크게, 이름>성분>제조사 위계 */}
        <section className={styles.hero}>
          <div className={styles.heroThumb}>
            <PillImage look={pill.look} size={92} />
          </div>
          <div>
            <h1 className={styles.heroName}>{pill.name}</h1>
            <span className={`badge ${styles.heroSub}`}>{pill.ingredient}</span>
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>{pill.manufacturer}</span>
            <span className={styles.metaChip}>{pill.shape}</span>
            <span className={styles.metaChip}>{pill.color}</span>
          </div>
        </section>

        {/* 요약 — 용법·용량은 부드럽게 */}
        <h2 className={styles.sectionHead}>복약 요약</h2>
        <div className={styles.summary}>
          {pill.summary.map((line, i) => (
            <div key={line.label} className={styles.fact}>
              <span className={styles.factIcon}>{FACT_ICONS[i]}</span>
              <span className={styles.factBody}>
                <span className={styles.factLabel}>{line.label}</span>
                <span className={styles.factValue}>{line.value}</span>
              </span>
            </div>
          ))}
        </div>

        {/* 주의 — 안전정보: 경고 톤 + 아이콘 + "주의" 라벨로 분리 강조 */}
        <section className={styles.caution} aria-labelledby="caution-head">
          <div className={styles.cautionHead} id="caution-head">
            <span className={styles.cautionIcon}><ShieldIcon /></span>
            복용 주의
          </div>
          <ul className={styles.cautionList}>
            {pill.cautions.map((c) => (
              <li key={c} className={styles.cautionItem}>{c}</li>
            ))}
          </ul>
        </section>

        {/* 이 약에 대해 물어보기 */}
        <h2 className={`${styles.sectionHead} ${styles.sessHead}`}>더 궁금한 점이 있나요?</h2>
        <div className={styles.sessList}>
          <button className={styles.newCard} onClick={onNewSession}>
            <span className={styles.newIcon}><PlusIcon /></span>
            <span className={styles.newBody}>
              <span className={styles.newTitle}>이 약에 대해 물어보기</span>
              <span className={styles.newDesc}>복용 시간·주의사항 등 무엇이든 편하게</span>
            </span>
            <span className={styles.newChev}><ChevronRight /></span>
          </button>
        </div>
      </div>
    </div>
  )
}
