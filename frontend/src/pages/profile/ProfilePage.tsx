import { useState } from 'react'
import { ChevronLeft } from '../../components/icons'
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

export default function ProfilePage({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  // 저장된 값이 있으면 폼을 그 값으로 채운다(수정 모드). 화면값 ← DB값 역매핑.
  const [bundle] = useState(loadHealth)
  const [age, setAge] = useState(() => {
    const by = bundle?.profile.birthYear
    return by ? String(CURRENT_YEAR - by) : ''
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
  const [meds, setMeds] = useState(() => bundle?.medications.map((m) => m.name).join(', ') ?? '')
  const [allergy, setAllergy] = useState(() => bundle?.allergies.map((a) => a.name).join(', ') ?? '')

  // 화면값 → ERD 구조로 매핑해서 저장.
  function handleDone() {
    const ageNum = Number(age.trim())
    const next: HealthBundle = {
      profile: {
        id: DEV_PROFILE_ID,
        userId: DEV_USER_ID, // FK → 시드 dev 유저
        birthYear: age.trim() && !Number.isNaN(ageNum) ? CURRENT_YEAR - ageNum : null,
        sex: sex === '남성' ? 'M' : sex === '기타' ? 'other' : 'F',
        isPregnant: preg === '임신 중',
        isBreastfeeding: preg === '수유 중',
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
      <p className="page-sub">나이·성별에 맞춰 더 안전하게 안내해드려요.</p>

      <div className={styles.reassure}>
        <span className={styles.reassureIcon}><HeartGlyph /></span>
        <span className={styles.reassureText}>
          <strong>한 번만 입력하면 돼요.</strong>
          <span className={styles.reassureSub}>입력한 정보로 복약 안내를 맞춤으로 챙겨드려요.</span>
        </span>
      </div>

      <div className={styles.form}>
        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="age">나이</label>
          <input id="age" className={`input ${styles.input}`} inputMode="numeric" placeholder="예: 34"
            value={age} onChange={(e) => setAge(e.target.value)} />
        </div>

        <div className={`field ${styles.field}`}>
          <span className={`field-label ${styles.label}`}>성별</span>
          <Segmented options={SEX} value={sex} onChange={setSex} />
        </div>

        <div className={`field ${styles.field}`}>
          <span className={`field-label ${styles.label}`}>임신 / 수유</span>
          <Segmented options={PREG} value={preg} onChange={setPreg} />
        </div>

        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="meds">
            복용 중인 약<span className={styles.optional}>선택</span>
          </label>
          <input id="meds" className={`input ${styles.input}`} placeholder="예: 혈압약, 종합감기약"
            value={meds} onChange={(e) => setMeds(e.target.value)} />
          <p className={styles.hint}>여러 개는 쉼표로 구분해 적어주세요.</p>
        </div>

        <div className={`field ${styles.field}`}>
          <label className={`field-label ${styles.label}`} htmlFor="allergy">
            알레르기<span className={styles.optional}>선택</span>
          </label>
          <input id="allergy" className={`input ${styles.input}`} placeholder="예: 페니실린, 아스피린"
            value={allergy} onChange={(e) => setAllergy(e.target.value)} />
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`btn-primary ${styles.submit}`} onClick={handleDone}>완료하고 시작하기</button>
        <p className={`page-foot ${styles.foot}`}>입력 정보는 이 기기에만 저장돼요.</p>
      </div>
    </div>
  )
}
