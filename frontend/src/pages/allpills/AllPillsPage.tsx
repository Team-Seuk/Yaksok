/* 전체 알약 사전 = DB에 적재된 모든 약을 검색·열람하는 화면.
   백엔드 GET /api/pill/dictionary 로 목록/검색을 받아온다. */
import { useEffect, useState } from 'react'
import PillImage, { type PillLook } from '../../components/PillImage'
import { ChevronLeft, ChevronRight, BookIcon } from '../../components/icons'
import { listPills, ApiError, type PillSummary } from '../../lib/api'
import styles from './AllPillsPage.module.css'

/* 실사진(image_url)이 없을 때 쓰는 기본 일러스트. */
const DEFAULT_LOOK: PillLook = { kind: 'round', color: '#e7ecee' }

export default function AllPillsPage({
  onBack,
  onSelect,
}: {
  onBack: () => void
  onSelect?: (itemSeq: string) => void
}) {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<PillSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const t = setTimeout(() => {
      listPills(q)
        .then((res) => {
          if (!cancelled) setItems(res)
        })
        .catch((e: unknown) => {
          if (!cancelled) setError(e instanceof ApiError ? e.message : '목록을 불러오지 못했어요.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250) // 입력 디바운스
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q])

  return (
    <div className="result">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="뒤로">
          <ChevronLeft />
        </button>
        <span className={styles.headBody}>
          <span className={styles.headName}>전체 알약 사전</span>
          <span className={styles.headSub}>
            {loading ? '불러오는 중…' : `${items.length}종`}
          </span>
        </span>
      </div>

      <div className={`result-scroll ${styles.scroll}`}>
        <input
          className={`input ${styles.search}`}
          type="search"
          placeholder="약 이름·분류 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="약 검색"
        />

        {error ? (
          <div className="state">
            <div className="state-icon">
              <BookIcon size={30} />
            </div>
            <p className="state-title">불러오지 못했어요</p>
            <p className="state-desc">{error}</p>
          </div>
        ) : loading ? (
          <div className="state">
            <p className="state-title">불러오는 중…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="state">
            <div className="state-icon">
              <BookIcon size={30} />
            </div>
            <p className="state-title">검색 결과가 없어요</p>
            <p className="state-desc">다른 이름이나 분류로 다시 찾아보세요.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {items.map((p) => (
              <li
                key={p.item_seq}
                className={styles.card}
                onClick={() => onSelect?.(p.item_seq)}
                style={onSelect ? { cursor: 'pointer' } : undefined}
              >
                <span className={styles.thumb}>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt=""
                      width={40}
                      height={40}
                      style={{ objectFit: 'contain', borderRadius: 8 }}
                    />
                  ) : (
                    <PillImage look={DEFAULT_LOOK} size={40} />
                  )}
                </span>
                <span className={styles.body}>
                  <span className={styles.name}>{p.item_name}</span>
                  <span className={styles.ingredient}>{p.entp_name ?? ''}</span>
                </span>
                {p.class_name && <span className={styles.category}>{p.class_name}</span>}
                {onSelect && <ChevronRight />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
