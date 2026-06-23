import { useState } from 'react'
import { ChevronLeft, MedKitIcon } from '../../components/icons'
import PillImage, { type PillLook } from '../../components/PillImage'
import styles from './SymptomPage.module.css'

/* 증상별 약 추천 = 증상 텍스트 → OTC 추천 (프로토타입: 더미 결과).
   ERD의 symptom_queries(user_id, symptom_text, result jsonb)에 대응. */
type Rec = { id: number; name: string; desc: string; look: PillLook }

const DUMMY: Rec[] = [
  { id: 1, name: '타이레놀정 500mg', desc: '해열·진통 · 아세트아미노펜', look: { kind: 'caplet', color: '#eef0f2' } },
  { id: 2, name: '이지엔6프로연질캡슐', desc: '진통·소염 · 덱시부프로펜', look: { kind: 'oval', color: '#d6464f' } },
  { id: 3, name: '판콜에이내복액', desc: '감기 제증상 완화', look: { kind: 'round', color: '#e6b84f' } },
]

/* 입력을 거들어주는 흔한 증상 예시 */
const QUICK = ['두통', '콧물·코막힘', '기침·가래', '소화불량', '근육통']

/* 빈 상태용 알약 일러스트 (시그니처) */
function PillSpark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5.5 12.5 12.5 5.5a4 4 0 0 1 5.6 5.6l-7 7a4 4 0 0 1-5.6-5.6Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <path d="m9 9 6 6" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
    </svg>
  )
}

/* 면책 안내용 — 안심 톤의 정보 아이콘 */
function InfoIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 11v5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.05" fill="currentColor" />
    </svg>
  )
}

export default function SymptomPage({ onBack }: { onBack: () => void }) {
  const [symptom, setSymptom] = useState('')
  const [results, setResults] = useState<Rec[] | null>(null)

  const canSubmit = symptom.trim().length > 0

  function addQuick(label: string) {
    setSymptom((prev) => (prev.trim() ? `${prev.trim()}, ${label}` : label))
  }

  return (
    <div className="screen screen--scroll">
      <button className="iconbtn back-row" onClick={onBack} aria-label="뒤로">
        <ChevronLeft />
      </button>
      <h1 className="page-title">증상별 약 추천</h1>
      <p className="page-sub">지금 느끼는 증상을 적어주면, 약국에서 살 수 있는 일반의약품(OTC)을 골라 안내해드려요.</p>

      <div className={styles.askCard}>
        <div className={styles.askHead}>
          <span className={styles.askIcon} aria-hidden="true">
            <MedKitIcon size={20} />
          </span>
          <span className={styles.askTitle}>어디가 불편하세요?</span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="symptom">증상 설명</label>
          <textarea
            id="symptom"
            className="input input--area"
            placeholder="예: 어제 저녁부터 머리가 지끈거리고 콧물이 나요"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
          />
        </div>

        <p className={styles.askHint}>이런 증상을 눌러 빠르게 더할 수도 있어요.</p>
        <div className={styles.chips}>
          {QUICK.map((q) => (
            <button key={q} type="button" className={styles.chip} onClick={() => addQuick(q)}>
              {q}
            </button>
          ))}
        </div>

        <button className="btn-primary" onClick={() => setResults(DUMMY)} disabled={!canSubmit}>
          추천받기
        </button>
      </div>

      {!results ? (
        <div className={styles.empty}>
          <span className={styles.emptyArt} style={{ color: 'var(--accent-deep)' }} aria-hidden="true">
            <PillSpark size={40} />
          </span>
          <p className={styles.emptyTitle}>아직 추천 결과가 없어요</p>
          <p className={styles.emptyDesc}>
            증상을 적고 추천받기를 누르면, 도움이 될 만한 일반의약품을 여기에 보여드릴게요.
          </p>
        </div>
      ) : (
        <div className={styles.results}>
          <div className="section-head">추천 일반의약품 · {results.length}개</div>
          <div className="rec-list">
            {results.map((r) => (
              <div key={r.id} className="rec-card">
                <div className="rec-thumb"><PillImage look={r.look} size={46} /></div>
                <div className="rec-body">
                  <div className="rec-name">{r.name}</div>
                  <div className="rec-desc">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.notice} role="note">
            <span className={styles.noticeIcon}>
              <InfoIcon size={20} />
            </span>
            <div className={styles.noticeBody}>
              <p className={styles.noticeTitle}>참고로 알아두세요</p>
              <p className={styles.noticeText}>
                일반의약품 안내일 뿐 의학적 진단이 아니에요. 증상이 지속되거나 심해지면 꼭 의사·약사와 상담해주세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
