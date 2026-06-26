/* '오늘의 약속' 편집 — 홈 카드가 박스째 펼쳐져 전체화면이 되는 화면(view-transition-name: today-card).
   복용 중인 약을 인라인으로 수정(언제·타이밍·횟수·용량)·삭제하고, 새 약은
   ①직접 입력 ②내 알약사전 ③전체 사전 검색 으로 추가한다. 변경은 즉시 localStorage에 저장. */
import { useState } from 'react'
import PillImage from '../../components/PillImage'
import { BookIcon, ChevronLeft, PlusIcon } from '../../components/icons'
import { loadCabinet } from '../../lib/cabinet'
import { ApiError, listPills, type PillSummary } from '../../lib/api'
import { DEV_PROFILE_ID, loadHealth, loadMedications, saveHealth } from '../../lib/storage'
import type { DoseTiming, DoseWhen, ID, Medication } from '../../lib/types'
import styles from './TodayEditPage.module.css'

const WHENS: DoseWhen[] = ['아침', '점심', '저녁', '자기 전']
const TIMINGS: DoseTiming[] = ['식전', '식후', '공복', '취침 전']
const PER_DAY = [1, 2, 3]
const DOSE = [1, 2, 3]

type AddMode = 'none' | 'choices' | 'manual' | 'mine' | 'search'

/* 아이콘 — icons.tsx는 건드리지 않고 이 화면 전용 인라인(연필·휴지통·돋보기). */
const glyph = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}
function PencilGlyph() {
  return (
    <svg {...glyph}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  )
}
function TrashGlyph() {
  return (
    <svg {...glyph}>
      <path d="M5 7h14M10 7V5h4v2M6.5 7l1 13h9l1-13" />
    </svg>
  )
}
function SearchGlyph() {
  return (
    <svg {...glyph}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  )
}
function CheckGlyph() {
  return (
    <svg {...glyph}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

/** 복용 스케줄 한 줄 요약 — "아침 식후 · 하루 1번 1정". 미설정이면 안내. */
function summarize(m: Medication): string {
  const head = [m.when, m.timing].filter(Boolean).join(' ')
  const freq = `하루 ${m.perDay ?? 1}번 · 한 번에 ${m.dose ?? 1}정`
  return head ? `${head} · ${freq}` : '복용 시점 미설정 — 수정에서 정해주세요'
}

/** 세그먼트 한 줄 — 고르면 즉시 onPick. */
function SegRow<T extends string | number>({
  label,
  options,
  value,
  suffix,
  onPick,
}: {
  label: string
  options: readonly T[]
  value: T | undefined
  suffix?: string
  onPick: (v: T) => void
}) {
  return (
    <div className={styles.seg}>
      <span className={styles.segLabel}>{label}</span>
      <div className={styles.segOpts} role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={String(opt)}
            type="button"
            className={`${styles.segBtn}${value === opt ? ` ${styles.segBtnOn}` : ''}`}
            aria-pressed={value === opt}
            onClick={() => onPick(opt)}
          >
            {opt}
            {suffix ?? ''}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TodayEditPage({ onBack }: { onBack: () => void }) {
  const [bundle] = useState(loadHealth)
  const [meds, setMeds] = useState<Medication[]>(loadMedications)
  const [editingId, setEditingId] = useState<ID | null>(null)
  const [confirmId, setConfirmId] = useState<ID | null>(null)
  const [addMode, setAddMode] = useState<AddMode>('none')
  const [newName, setNewName] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [results, setResults] = useState<PillSummary[]>([])
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState<string | null>(null)

  const profileId = bundle?.profile.id ?? DEV_PROFILE_ID

  /* 변경은 항상 즉시 저장(고르면 바로 적용). */
  function persist(next: Medication[]) {
    setMeds(next)
    if (bundle) saveHealth({ ...bundle, medications: next })
  }
  function patch(id: ID, p: Partial<Medication>) {
    persist(meds.map((m) => (m.id === id ? { ...m, ...p } : m)))
  }
  function remove(id: ID) {
    persist(meds.filter((m) => m.id !== id))
    setConfirmId(null)
    if (editingId === id) setEditingId(null)
  }
  function resetAdd() {
    setAddMode('none')
    setNewName('')
    setSearchQ('')
    setResults([])
    setSearchErr(null)
  }
  /* 새 약 추가 — 이름으로(직접 입력·내 사전·검색 결과 공통). 추가 후 설정 펼침. */
  function addByName(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = meds.reduce((mx, m) => Math.max(mx, m.id), 0) + 1
    persist([...meds, { id, profileId, name: trimmed, when: '아침', timing: '식후', perDay: 1, dose: 1 }])
    resetAdd()
    setEditingId(id)
  }
  async function runSearch() {
    const q = searchQ.trim()
    if (!q) return
    setSearching(true)
    setSearchErr(null)
    try {
      setResults(await listPills(q, 20))
    } catch (e) {
      setSearchErr(e instanceof ApiError ? e.message : '검색에 실패했어요.')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className={`screen screen--scroll ${styles.page}`} style={{ viewTransitionName: 'today-card' }}>
      <header className={styles.top}>
        <button className="iconbtn back-row" onClick={onBack} aria-label="뒤로가기">
          <ChevronLeft />
        </button>
        <h1 className={styles.title}>오늘의 약속</h1>
        <p className={styles.sub}>복용 중인 약을 수정·삭제하거나 새로 추가하세요.</p>
      </header>

      <ul className={styles.list}>
        {meds.map((m, i) => (
          <li key={m.id} className={styles.item} style={{ animationDelay: `${i * 55}ms` }}>
            {confirmId === m.id ? (
              <div className={styles.confirm}>
                <span className={styles.confirmText}>‘{m.name}’을(를) 삭제할까요?</span>
                <div className={styles.confirmBtns}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setConfirmId(null)}>
                    취소
                  </button>
                  <button type="button" className={styles.deleteBtn} onClick={() => remove(m.id)}>
                    삭제
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.row}>
                  <span className={styles.thumb} aria-hidden="true">
                    <PillImage look={{ kind: 'capsule', color: 'var(--accent)', color2: 'var(--bg-elev)' }} size={44} />
                  </span>
                  <span className={styles.body}>
                    <span className={styles.name}>{m.name}</span>
                    <span className={styles.meta}>{summarize(m)}</span>
                  </span>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={`${styles.act}${editingId === m.id ? ` ${styles.actOn}` : ''}`}
                      aria-expanded={editingId === m.id}
                      aria-label={editingId === m.id ? `${m.name} 설정 저장하고 닫기` : `${m.name} 복용 설정 수정`}
                      onClick={() => setEditingId(editingId === m.id ? null : m.id)}
                    >
                      {editingId === m.id ? (
                        <>
                          <CheckGlyph />
                          저장
                        </>
                      ) : (
                        <>
                          <PencilGlyph />
                          수정
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className={styles.act}
                      aria-label={`${m.name} 삭제`}
                      onClick={() => setConfirmId(m.id)}
                    >
                      <TrashGlyph />
                      삭제
                    </button>
                  </div>
                </div>

                {editingId === m.id && (
                  <div className={styles.panel}>
                    <SegRow label="언제" options={WHENS} value={m.when} onPick={(v) => patch(m.id, { when: v })} />
                    <SegRow label="타이밍" options={TIMINGS} value={m.timing} onPick={(v) => patch(m.id, { timing: v })} />
                    <SegRow label="하루 몇 번" options={PER_DAY} value={m.perDay ?? 1} suffix="번" onPick={(v) => patch(m.id, { perDay: v })} />
                    <SegRow label="한 번에" options={DOSE} value={m.dose ?? 1} suffix="정" onPick={(v) => patch(m.id, { dose: v })} />
                    <p className={styles.savedNote}>고르면 바로 저장돼요.</p>
                  </div>
                )}
              </>
            )}
          </li>
        ))}

        {/* 새로운 약 추가 — 3가지 방법 */}
        <li className={`${styles.item} ${styles.itemAdd}`} style={{ animationDelay: `${meds.length * 55}ms` }}>
          {addMode === 'none' && (
            <button type="button" className={styles.addCard} onClick={() => setAddMode('choices')}>
              <span className={styles.addIcon} aria-hidden="true">
                <PlusIcon size={20} />
              </span>
              <span className={styles.addLabel}>새로운 약 추가</span>
            </button>
          )}

          {addMode === 'choices' && (
            <div className={styles.choices}>
              <p className={styles.choicesHead}>어떻게 추가할까요?</p>
              <button type="button" className={styles.choiceCard} onClick={() => setAddMode('manual')}>
                <span className={styles.choiceIcon} aria-hidden="true"><PencilGlyph /></span>
                <span className={styles.choiceText}>
                  <span className={styles.choiceTitle}>직접 이름 입력</span>
                  <span className={styles.choiceDesc}>약 이름을 손으로 적어 추가</span>
                </span>
              </button>
              <button type="button" className={styles.choiceCard} onClick={() => setAddMode('mine')}>
                <span className={styles.choiceIcon} aria-hidden="true"><BookIcon size={16} /></span>
                <span className={styles.choiceText}>
                  <span className={styles.choiceTitle}>내 알약사전에서</span>
                  <span className={styles.choiceDesc}>그동안 알아본 약에서 고르기</span>
                </span>
              </button>
              <button type="button" className={styles.choiceCard} onClick={() => setAddMode('search')}>
                <span className={styles.choiceIcon} aria-hidden="true"><SearchGlyph /></span>
                <span className={styles.choiceText}>
                  <span className={styles.choiceTitle}>전체 사전에서 찾기</span>
                  <span className={styles.choiceDesc}>식약처 전체 알약에서 검색</span>
                </span>
              </button>
              <button type="button" className={styles.backBtn} onClick={resetAdd}>
                취소
              </button>
            </div>
          )}

          {addMode === 'manual' && (
            <div className={styles.addForm}>
              <input
                className="input"
                autoFocus
                placeholder="약 이름 (예: 타이레놀정 500mg)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addByName(newName)
                }}
                aria-label="새로운 약 이름"
              />
              <div className={styles.addBtns}>
                <button type="button" className={styles.cancelBtn} onClick={() => setAddMode('choices')}>
                  뒤로
                </button>
                <button type="button" className={styles.addConfirm} onClick={() => addByName(newName)} disabled={!newName.trim()}>
                  추가
                </button>
              </div>
            </div>
          )}

          {addMode === 'mine' && (
            <div className={styles.picker}>
              <p className={styles.pickerTitle}>내 알약사전</p>
              <div className={styles.pickList}>
                {loadCabinet().map((e) => (
                  <button key={e.id} type="button" className={styles.pickItem} onClick={() => addByName(e.name)}>
                    <span className={styles.pickThumb} aria-hidden="true">
                      <PillImage look={e.look} size={36} />
                    </span>
                    <span className={styles.pickBody}>
                      <span className={styles.pickName}>{e.name}</span>
                      <span className={styles.pickSub}>{e.category}</span>
                    </span>
                    <span className={styles.pickAdd} aria-hidden="true">
                      <PlusIcon size={18} />
                    </span>
                  </button>
                ))}
              </div>
              <button type="button" className={styles.backBtn} onClick={() => setAddMode('choices')}>
                뒤로
              </button>
            </div>
          )}

          {addMode === 'search' && (
            <div className={styles.picker}>
              <p className={styles.pickerTitle}>전체 사전에서 찾기</p>
              <div className={styles.searchBar}>
                <input
                  className="input"
                  autoFocus
                  placeholder="약 이름 검색 (예: 타이레놀)"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runSearch()
                  }}
                  aria-label="전체 사전 검색어"
                />
                <button type="button" className={styles.searchBtn} onClick={runSearch} disabled={!searchQ.trim() || searching} aria-label="검색">
                  <SearchGlyph />
                </button>
              </div>
              {searching && <p className={styles.stateMsg}>찾는 중…</p>}
              {searchErr && <p className={styles.stateMsg}>{searchErr}</p>}
              {!searching && !searchErr && results.length === 0 && searchQ.trim() && (
                <p className={styles.stateMsg}>검색 결과가 없어요.</p>
              )}
              {results.length > 0 && (
                <div className={styles.pickList}>
                  {results.map((r) => (
                    <button key={r.item_seq} type="button" className={styles.pickItem} onClick={() => addByName(r.item_name)}>
                      <span className={styles.pickThumb}>
                        {r.image_url ? (
                          <img className={styles.pickImg} src={r.image_url} alt="" loading="lazy" />
                        ) : (
                          <PillImage look={{ kind: 'capsule', color: 'var(--accent)', color2: 'var(--bg-elev)' }} size={36} />
                        )}
                      </span>
                      <span className={styles.pickBody}>
                        <span className={styles.pickName}>{r.item_name}</span>
                        <span className={styles.pickSub}>{r.entp_name ?? r.class_name ?? ''}</span>
                      </span>
                      <span className={styles.pickAdd} aria-hidden="true">
                        <PlusIcon size={18} />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </li>
      </ul>
    </div>
  )
}
