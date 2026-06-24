/* 전체 알약 사전 = 데이터셋에 등록된 모든 약을 검색·열람하는 화면.
   ※ 임시 더미 데이터. 실제 데이터셋이 들어오면 pillData.ts를 교체하면 된다. */
import { useMemo, useState } from 'react'
import PillImage from '../../components/PillImage'
import { ChevronLeft, ChevronRight, BookIcon } from '../../components/icons'
import { PILLS } from '../../lib/pillData'
import styles from './AllPillsPage.module.css'

export default function AllPillsPage({
  onBack,
  onSelect,
}: {
  onBack: () => void
  onSelect?: (id: number) => void
}) {
  const [q, setQ] = useState('')

  const results = useMemo(() => {
    const k = q.trim().toLowerCase()
    if (!k) return PILLS
    return PILLS.filter(
      (p) =>
        p.name.toLowerCase().includes(k) ||
        p.ingredient.toLowerCase().includes(k) ||
        p.category.toLowerCase().includes(k),
    )
  }, [q])

  return (
    <div className="result">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="뒤로">
          <ChevronLeft />
        </button>
        <span className={styles.headBody}>
          <span className={styles.headName}>전체 알약 사전</span>
          <span className={styles.headSub}>등록된 약 {PILLS.length}종</span>
        </span>
      </div>

      <div className={`result-scroll ${styles.scroll}`}>
        <input
          className={`input ${styles.search}`}
          type="search"
          placeholder="약 이름·성분·분류 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="약 검색"
        />

        {results.length === 0 ? (
          <div className="state">
            <div className="state-icon">
              <BookIcon size={30} />
            </div>
            <p className="state-title">검색 결과가 없어요</p>
            <p className="state-desc">다른 이름이나 성분으로 다시 찾아보세요.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {results.map((p) => (
              <li
                key={p.id}
                className={styles.card}
                onClick={() => onSelect?.(p.id)}
                style={onSelect ? { cursor: 'pointer' } : undefined}
              >
                <span className={styles.thumb}>
                  <PillImage look={p.look} size={40} />
                </span>
                <span className={styles.body}>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.ingredient}>{p.ingredient}</span>
                </span>
                <span className={styles.category}>{p.category}</span>
                {onSelect && <ChevronRight />}
              </li>
            ))}
          </ul>
        )}

        <p className={styles.note}>임시 데이터예요. 실제 의약품 데이터셋이 준비되면 이곳에 반영돼요.</p>
      </div>
    </div>
  )
}
