/* 전체 알약 사전 = 데이터셋에 등록된 모든 약을 검색·열람하는 화면.
   ※ 임시 더미 데이터. 실제 데이터셋이 들어오면 PILLS를 교체하면 된다. */
import { useMemo, useState } from 'react'
import PillImage, { type PillLook } from '../../components/PillImage'
import { ChevronLeft, BookIcon } from '../../components/icons'
import styles from './AllPillsPage.module.css'

type Pill = { id: number; name: string; ingredient: string; category: string; look: PillLook }

const PILLS: Pill[] = [
  { id: 1, name: '타이레놀정 500mg', ingredient: '아세트아미노펜 500mg', category: '해열진통제', look: { kind: 'caplet', color: '#eef0f2' } },
  { id: 2, name: '이지엔6프로연질캡슐', ingredient: '덱시부프로펜 300mg', category: '소염진통제', look: { kind: 'oval', color: '#d6464f' } },
  { id: 3, name: '게보린정', ingredient: '아세트아미노펜·카페인 복합', category: '복합 진통제', look: { kind: 'round', color: '#ece6e0' } },
  { id: 4, name: '베아제정', ingredient: '소화효소 복합', category: '소화제', look: { kind: 'round', color: '#f3d9a0' } },
  { id: 5, name: '겔포스엠현탁액', ingredient: '인산알루미늄겔 등', category: '제산제', look: { kind: 'capsule', color: '#bfe3df', color2: '#ffffff' } },
  { id: 6, name: '판콜에이내복액', ingredient: '아세트아미노펜 등 복합', category: '종합감기약', look: { kind: 'capsule', color: '#c98a3a', color2: '#f0d9b5' } },
  { id: 7, name: '지르텍정', ingredient: '세티리진염산염 10mg', category: '항히스타민제', look: { kind: 'round', color: '#dfe7ef' } },
  { id: 8, name: '에어탈정', ingredient: '아세클로페낙 100mg', category: '소염진통제', look: { kind: 'round', color: '#f4f1ea' } },
  { id: 9, name: '무코스타정', ingredient: '레바미피드 100mg', category: '위점막보호제', look: { kind: 'round', color: '#f0e2b8' } },
  { id: 10, name: '신신파스아렉스', ingredient: '멘톨·살리실산메틸 등', category: '외용 진통소염', look: { kind: 'caplet', color: '#e7eef0' } },
  { id: 11, name: '훼스탈플러스정', ingredient: '판크레아틴 등 소화효소', category: '소화제', look: { kind: 'round', color: '#e9d6c2' } },
  { id: 12, name: '아스피린프로텍트정', ingredient: '아세틸살리실산 100mg', category: '항혈전·진통', look: { kind: 'round', color: '#f4f4f2' } },
]

export default function AllPillsPage({ onBack }: { onBack: () => void }) {
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
              <li key={p.id} className={styles.card}>
                <span className={styles.thumb}>
                  <PillImage look={p.look} size={40} />
                </span>
                <span className={styles.body}>
                  <span className={styles.name}>{p.name}</span>
                  <span className={styles.ingredient}>{p.ingredient}</span>
                </span>
                <span className={styles.category}>{p.category}</span>
              </li>
            ))}
          </ul>
        )}

        <p className={styles.note}>임시 데이터예요. 실제 의약품 데이터셋이 준비되면 이곳에 반영돼요.</p>
      </div>
    </div>
  )
}
