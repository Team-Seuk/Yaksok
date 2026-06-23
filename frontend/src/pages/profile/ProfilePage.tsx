import { useState } from 'react'
import { ChevronLeft, DocIcon } from '../../components/icons'
import { loadHealth, saveHealth, DEV_USER_ID, DEV_PROFILE_ID, type HealthBundle } from '../../lib/storage'
import styles from './ProfilePage.module.css'

/* 안심 배너 아이콘 — 주제(돌봄)에 맞는 하트. 인라인 SVG(icons.tsx 수정 금지). */
function HeartGlyph() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />
    </svg>
  )
}

const SEX = ['여성', '남성', '기타'] as const
const PREG = ['해당 없음', '임신 중', '수유 중'] as const
const CURRENT_YEAR = new Date().getFullYear()

type Seg<T extends readonly string[]> = T[number]

function Segmented<T extends readonly string[]>({
  options,
  value,
  onChange,
}: {
  options: T
  value: Seg<T>
  onChange: (v: Seg<T>) => void
}) {
  return (
    <div className="seg" role="group">
      {options.map((opt) => (
        <button
          key={opt}
          className={`seg-btn${value === opt ? ' seg-btn--on' : ''}`}
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

/** "혈압약, 종합감기약" → ['혈압약', '종합감기약'] (1:N 목록으로 분리) */
function splitNames(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

/** 출생연도 유효성 — 1900 ~ 올해 사이의 4자리 연도만 통과 */
function isValidBirthYear(s: string): boolean {
  const n = Number(s.trim())
  return /^\d{4}$/.test(s.trim()) && n >= 1900 && n <= CURRENT_YEAR
}

/* 문서(건강검진·검사 결과)에서 뽑아낸다고 가정하는 데모 추출값.
   실제 촬영·비전 추출은 백엔드 연동(후속). 지금은 빈 칸만 채워 흐름을 보여준다. */
const DOC_EXTRACT = {
  birthYear: '1990',
  bloodPressure: '124/82',
  bmi: '23.4',
  history: '고혈압 경계',
} as const

export default function ProfilePage({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  // 저장된 값이 있으면 폼을 그 값으로 채운다(수정 모드). 화면값 ← DB값 역매핑.
  const [bundle] = useState(loadHealth)

  // ---- 필수 ----
  const [birthYear, setBirthYear] = useState(() => {
    const by = bundle?.profile.birthYear
    return by ? String(by) : ''
  })
  const [sex, setSex] = useState<Seg<typeof SEX>>(() => {
    const s = bundle?.profile.sex
    return s === 'M' ? '남성' : s === 'other' ? '기타' : '여성'
  })
  const [preg, setPreg] = useState<Seg<typeof PREG>>(() => {
    if (bundle?.profile.isPregnant) return '임신 중'
    if (bundle?.profile.isBreastfeeding) return '수유 중'
    return '해당 없음'
  })

  // ---- 선택 ----
  const [meds, setMeds] = useState(() => bundle?.medications.map((m) => m.name).join(', ') ?? '')
  const [allergy, setAllergy] = useState(() => bundle?.allergies.map((a) => a.name).join(', ') ?? '')
  const [bloodPressure, setBloodPressure] = useState(() => bundle?.profile.bloodPressure ?? '')
  const [history, setHistory] = useState(() => bundle?.profile.medicalHistory ?? '')
  const [bmi, setBmi] = useState(() => {
    const b = bundle?.profile.bmi
    return b != null ? String(b) : ''
  })

  // ---- 문서 자동 채우기 상태 ----
  const [scanning, setScanning] = useState(false)
  const [filledNote, setFilledNote] = useState<string | null>(null)

  const requiredOk = isValidBirthYear(birthYear) // 성별·임신/수유는 항상 값이 있어 출생연도가 게이트

  /* 문서 촬영 → 빈 칸만 채움. 이미 입력된 값은 덮어쓰지 않는다. */
  function fillFromDocument() {
    if (scanning) return
    setScanning(true)
    setFilledNote(null)
    setTimeout(() => {
      const filled: string[] = []
      if (!birthYear.trim()) { setBirthYear(DOC_EXTRACT.birthYear); filled.push('출생연도') }
      if (!bloodPressure.trim()) { setBloodPressure(DOC_EXTRACT.bloodPressure); filled.push('혈압') }
      if (!bmi.trim()) { setBmi(DOC_EXTRACT.bmi); filled.push('BMI') }
      if (!history.trim()) { setHistory(DOC_EXTRACT.history); filled.push('병력') }
      setScanning(false)
      setFilledNote(
        filled.length > 0
          ? `문서에서 ${filled.length}개 항목을 채웠어요 · ${filled.join(', ')}`
          : '이미 입력된 항목이라 새로 채울 내용이 없었어요.',
      )
    }, 900)
  }

  // 화면값 → ERD 구조로 매핑해서 저장.
  function handleDone() {
    if (!requiredOk) return
    const bmiNum = Number(bmi.trim())
    const next: HealthBundle = {
      profile: {
        id: DEV_PROFILE_ID,
        userId: DEV_USER_ID, // FK → 시드 dev 유저
        birthYear: Number(birthYear.trim()),
        sex: sex === '남성' ? 'M' : sex === '기타' ? 'other' : 'F',
        isPregnant: preg === '임신 중',
        isBreastfeeding: preg === '수유 중',
        bloodPressure: bloodPressure.trim() || null,
        medicalHistory: history.trim() || null,
        bmi: bmi.trim() && !Number.isNaN(bmiNum) ? bmiNum : null,
      },
      medications: splitNames(meds).map((name, i) => ({ id: i + 1, profileId: DEV_PROFILE_ID, name })),
      allergies: splitNames(allergy).map((name, i) => ({ id: i + 1, profileId: DEV_PROFILE_ID, name })),
    }
    saveHealth(next)
    onDone()
  }

  return (
    <div className="screen screen--scroll">
      {onBack && (
        <button className="iconbtn back-row" onClick={onBack} aria-label="뒤로">
          <ChevronLeft />
        </button>
      )}
      <h1 className="page-title">내 정보 입력</h1>
      <p className="page-sub">필수 항목을 채우면 시작할 수 있어요. 더 알려주실수록 안내가 정확해져요.</p>

      <div className={styles.reassure}>
        <span className={styles.reassureIcon}><HeartGlyph /></span>
        <span className={styles.reassureText}>
          <strong>한 번만 입력하면 돼요.</strong>
          <span className={styles.reassureSub}>입력한 정보로 복약 안내를 맞춤으로 챙겨드려요.</span>
        </span>
      </div>

      {/* 문서로 자동 채우기 — 건강검진·검사 결과 촬영(데모) */}
      <button
        type="button"
        className={styles.docScan}
        onClick={fillFromDocument}
        disabled={scanning}
        aria-busy={scanning}
      >
        <span className={styles.docIcon}>{scanning ? <span className={styles.docSpinner} aria-hidden="true" /> : <DocIcon size={22} />}</span>
        <span className={styles.docBody}>
          <span className={styles.docTitle}>{scanning ? '문서에서 정보를 읽는 중…' : '건강검진·검사 결과로 채우기'}</span>
          <span className={styles.docDesc}>문서를 촬영하면 출생연도·혈압·BMI 등을 자동으로 채워드려요.</span>
        </span>
      </button>
      {filledNote && <p className={styles.filledNote}>{filledNote}</p>}

      {/* ===== 필수 입력 ===== */}
      <h2 className={styles.sectionTitle}>
        필수 입력<span className={styles.sectionTag}>시작에 꼭 필요해요</span>
      </h2>
      <div className={styles.form}>
        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="birthYear">
            출생연도<span className={styles.required} aria-hidden="true">*</span>
          </label>
          <input
            id="birthYear"
            className={`input ${styles.input}`}
            inputMode="numeric"
            maxLength={4}
            placeholder="예: 1990"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          {isValidBirthYear(birthYear) && (
            <p className={styles.yearHint}>{birthYear}년생 · 만 {CURRENT_YEAR - Number(birthYear)}세</p>
          )}
        </div>

        <div className={`field ${styles.field}`}>
          <span className={`field-label ${styles.label}`}>성별<span className={styles.required} aria-hidden="true">*</span></span>
          <Segmented options={SEX} value={sex} onChange={setSex} />
        </div>

        <div className={`field ${styles.field}`}>
          <span className={`field-label ${styles.label}`}>임신 / 수유<span className={styles.required} aria-hidden="true">*</span></span>
          <Segmented options={PREG} value={preg} onChange={setPreg} />
        </div>
      </div>

      {/* ===== 선택 입력 ===== */}
      <h2 className={styles.sectionTitle}>
        선택 입력<span className={styles.sectionTag}>나중에 채워도 괜찮아요</span>
      </h2>
      <div className={styles.form}>
        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="meds">복용 중인 약</label>
          <input id="meds" className={`input ${styles.input}`} placeholder="예: 혈압약, 종합감기약"
            value={meds} onChange={(e) => setMeds(e.target.value)} />
          <p className={styles.hint}>여러 개는 쉼표로 구분해 적어주세요.</p>
        </div>

        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="allergy">알레르기</label>
          <input id="allergy" className={`input ${styles.input}`} placeholder="예: 페니실린, 아스피린"
            value={allergy} onChange={(e) => setAllergy(e.target.value)} />
        </div>

        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="bp">혈압</label>
          <input id="bp" className={`input ${styles.input}`} inputMode="numeric" placeholder="예: 120/80"
            value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} />
        </div>

        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="history">병력</label>
          <input id="history" className={`input ${styles.input}`} placeholder="예: 고혈압, 당뇨"
            value={history} onChange={(e) => setHistory(e.target.value)} />
        </div>

        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="bmi">BMI</label>
          <input id="bmi" className={`input ${styles.input}`} inputMode="decimal" placeholder="예: 23.4"
            value={bmi} onChange={(e) => setBmi(e.target.value.replace(/[^\d.]/g, ''))} />
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`btn-primary ${styles.submit}`} onClick={handleDone} disabled={!requiredOk}>
          완료하고 시작하기
        </button>
        {!requiredOk && <p className={styles.requiredHint}>출생연도를 입력하면 시작할 수 있어요.</p>}
        <p className={`page-foot ${styles.foot}`}>입력 정보는 이 기기에만 저장돼요.</p>
      </div>
    </div>
  )
}
