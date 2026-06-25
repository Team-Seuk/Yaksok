/* 알약사전 상세 — GET /api/pill/dictionary/{item_seq} 로 실데이터 조회.
   디자인은 기존 ResultPage(.module.css)를 재사용한다. cabinet의 /pill/:id 는 별개. */
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, PlusIcon } from '../../components/icons'
import PillImage, { type PillLook } from '../../components/PillImage'
import { getPillDetail, ApiError, type PillDetailInfo } from '../../lib/api'
import styles from '../result/ResultPage.module.css'

const DEFAULT_LOOK: PillLook = { kind: 'round', color: '#e7ecee' }

function DocIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M13.5 3.5V8h4M9 12h6M9 15.5h6" />
    </svg>
  )
}
function PillFactIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" />
      <path d="M12 8.5v7" />
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
const FACT_ICONS = [<DocIcon />, <PillFactIcon />]

export default function PillDetailPage({
  itemSeq,
  onBack,
  onAsk,
}: {
  itemSeq: string
  onBack: () => void
  onAsk?: () => void
}) {
  const [pill, setPill] = useState<PillDetailInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)
    getPillDetail(itemSeq)
      .then((d) => {
        if (!cancelled) setPill(d)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 404) setNotFound(true)
        else setError(e instanceof ApiError ? e.message : '불러오지 못했어요.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [itemSeq])

  if (loading || error || notFound || !pill) {
    return (
      <div className="result">
        <div className="topbar">
          <button className="iconbtn" onClick={onBack} aria-label="뒤로">
            <ChevronLeft />
          </button>
        </div>
        <div className="state">
          <p className="state-title">
            {loading ? '불러오는 중…' : notFound ? '약을 찾을 수 없어요' : '불러오지 못했어요'}
          </p>
          {!loading && <p className="state-desc">{error ?? '다른 약으로 다시 시도해 주세요.'}</p>}
        </div>
      </div>
    )
  }

  const facts = [
    pill.efcy ? { label: '효능·효과', value: pill.efcy } : null,
    pill.use_method ? { label: '용법·용량', value: pill.use_method } : null,
  ].filter((f): f is { label: string; value: string } => f !== null)

  const cautions = (pill.caution ?? '')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const metaChips = [pill.entp_name, pill.shape, pill.color_front, pill.form].filter(Boolean)

  return (
    <div className="result">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="뒤로">
          <ChevronLeft />
        </button>
      </div>

      <div className={`result-scroll ${styles.scroll}`}>
        <section className={styles.hero}>
          <div className={styles.heroThumb}>
            {pill.image_url ? (
              <img
                src={pill.image_url}
                alt=""
                width={92}
                height={92}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <PillImage look={DEFAULT_LOOK} size={92} />
            )}
          </div>
          <div>
            <h1 className={styles.heroName}>{pill.item_name}</h1>
            {pill.class_name && <span className={`badge ${styles.heroSub}`}>{pill.class_name}</span>}
          </div>
          <div className={styles.heroMeta}>
            {metaChips.map((c) => (
              <span key={c} className={styles.metaChip}>
                {c}
              </span>
            ))}
          </div>
        </section>

        {facts.length > 0 && (
          <>
            <h2 className={styles.sectionHead}>복약 요약</h2>
            <div className={styles.summary}>
              {facts.map((line, i) => (
                <div key={line.label} className={styles.fact}>
                  <span className={styles.factIcon}>{FACT_ICONS[i % FACT_ICONS.length]}</span>
                  <span className={styles.factBody}>
                    <span className={styles.factLabel}>{line.label}</span>
                    <span className={styles.factValue}>{line.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {cautions.length > 0 && (
          <section className={styles.caution} aria-labelledby="caution-head">
            <div className={styles.cautionHead} id="caution-head">
              <span className={styles.cautionIcon}>
                <ShieldIcon />
              </span>
              복용 주의
            </div>
            <ul className={styles.cautionList}>
              {cautions.map((c) => (
                <li key={c} className={styles.cautionItem}>
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}

        <h2 className={`${styles.sectionHead} ${styles.sessHead}`}>더 궁금한 점이 있나요?</h2>
        <div className={styles.sessList}>
          <button className={styles.newCard} onClick={onAsk}>
            <span className={styles.newIcon}>
              <PlusIcon />
            </span>
            <span className={styles.newBody}>
              <span className={styles.newTitle}>이 약에 대해 물어보기</span>
              <span className={styles.newDesc}>복용 시간·주의사항 등 무엇이든 편하게</span>
            </span>
            <span className={styles.newChev}>
              <ChevronRight />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
