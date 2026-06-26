import PillImage from '../../components/PillImage'
import { BookIcon, ChevronRight, ChatIcon } from '../../components/icons'
import { loadCabinet } from '../../lib/cabinet'
import styles from './CabinetPage.module.css'

export default function CabinetPage({ onOpen }: { onOpen: (id: number) => void }) {
  const entries = loadCabinet()
  const isEmpty = entries.length === 0

  return (
    <div className="screen screen--scroll">
      <h1 className="page-title">알약 사전</h1>
      <p className="page-sub">그동안 알아본 약들</p>

      {isEmpty ? (
        <div className="state">
          <div className="state-icon">
            <BookIcon size={30} />
          </div>
          <p className="state-title">아직 사전이 비어 있어요</p>
          <p className="state-desc">
            대화 도우미와 이야기하다 언급된 약이 이곳에 사전처럼 차곡차곡 모여요. 천천히 시작해 볼까요?
          </p>
          <div className="state-action">
            <span className="badge">
              <ChatIcon size={16} />
              대화로 약 물어보기
            </span>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {entries.map((e) => (
            <button key={e.id} className={styles.card} onClick={() => onOpen(e.id)} aria-label={e.name}>
              <div className={styles.thumb}>
                <PillImage look={e.look} size={44} />
              </div>

              <div className={styles.main}>
                <div className={styles.head}>
                  <span className={styles.name}>{e.name}</span>
                  <span className={styles.chev}>
                    <ChevronRight size={18} />
                  </span>
                </div>

                <div className={styles.tags}>
                  {e.ingredient && <span className={styles.ingredient}>{e.ingredient}</span>}
                  <span className={styles.category}>{e.category}</span>
                </div>

                <p className={styles.summary}>{e.summary}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
