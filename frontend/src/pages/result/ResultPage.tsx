import { ChevronLeft, ChevronRight, PlusIcon } from '../../components/icons'
import PillImage from '../../components/PillImage'
import styles from './ResultPage.module.css'

/* 약품 상세 = 약 정보 + 요약(진입 시 바로) + 이 약에 대한 개별 세션 목록 (프로토타입: 더미) */

/* 용법·용량 등 기본 안내 (안심되는 톤) */
const SUMMARY_LINES = [
  { label: '용법', value: '1회 1~2정 · 4~6시간 간격으로' },
  { label: '용량', value: '하루 최대 4g 이하로 지켜 주세요' },
  { label: '복용 시점', value: '식후 30분에 드시면 편해요' },
]

/* 주의 = 안전정보. 색만 아니라 라벨·아이콘으로 분리 강조 */
const CAUTIONS = [
  '위장이 예민하면 빈속 복용을 피해 주세요.',
  '다른 소염진통제와 함께 먹지 마세요.',
  '증상이 3일 넘게 이어지면 약사·의사와 상담하세요.',
]

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
            <PillImage look={{ kind: 'oval', color: '#d6464f' }} size={92} />
          </div>
          <div>
            <h1 className={styles.heroName}>이지엔6프로연질캡슐</h1>
            <span className={`badge ${styles.heroSub}`}>덱시부프로펜 300mg</span>
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>대웅제약</span>
            <span className={styles.metaChip}>타원형</span>
            <span className={styles.metaChip}>빨강</span>
            <span className={styles.metaChip}>식별 -</span>
          </div>
        </section>

        {/* 요약 — 용법·용량은 부드럽게 */}
        <h2 className={styles.sectionHead}>복약 요약</h2>
        <div className={styles.summary}>
          {SUMMARY_LINES.map((line, i) => (
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
            {CAUTIONS.map((c) => (
              <li key={c} className={styles.cautionItem}>{c}</li>
            ))}
          </ul>
        </section>

        {/* 이 약에 대해 물어보기 — 대화 기록은 '대화' 탭으로 분리, 여기선 새 대화만 */}
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
