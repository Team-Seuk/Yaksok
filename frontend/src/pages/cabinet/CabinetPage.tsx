import PillImage, { type PillLook } from '../../components/PillImage'
import { BookIcon, ChevronRight, ChatIcon } from '../../components/icons'
import styles from './CabinetPage.module.css'

/* 알약사전 = 대화 중 언급된 약들을 사전 형태로 모아 보여주는 화면.
   대화 기록(세션)은 '대화' 탭으로 분리됨 — 여기선 '내가 접한 약'의 정보만 (프로토타입: 더미). */
type Entry = { id: number; name: string; ingredient: string; category: string; summary: string; look: PillLook }

const ENTRIES: Entry[] = [
  { id: 1, name: '이지엔6프로연질캡슐', ingredient: '덱시부프로펜 300mg', category: '소염진통제', summary: '생리통·두통·치통에 쓰는 비스테로이드성 진통제. 위장 자극이 적은 편이에요.', look: { kind: 'oval', color: '#d6464f' } },
  { id: 2, name: '타이레놀정 500mg', ingredient: '아세트아미노펜 500mg', category: '해열진통제', summary: '발열·두통에 두루 쓰는 진통제. 하루 4g을 넘기지 않도록 주의해요.', look: { kind: 'caplet', color: '#eef0f2' } },
  { id: 3, name: '계보린정', ingredient: '아세트아미노펜·카페인 복합', category: '복합 진통제', summary: '카페인이 함유돼 야간 복용 시 수면을 방해할 수 있어요.', look: { kind: 'round', color: '#ece6e0' } },
  { id: 4, name: '베아제정', ingredient: '소화효소 복합', category: '소화제', summary: '과식·더부룩함에 쓰는 소화효소제. 식후에 복용해요.', look: { kind: 'round', color: '#f3d9a0' } },
]

export default function CabinetPage({ onOpen }: { onOpen: (id: number) => void }) {
  const isEmpty = ENTRIES.length === 0

  return (
    <div className="screen screen--scroll">
      <h1 className="page-title">알약사전</h1>
      <p className="page-sub">
        {isEmpty
          ? '대화 중 만난 약이 여기에 사전처럼 모여요'
          : `대화하며 만난 약 ${ENTRIES.length}가지 · 탭하면 자세히 볼 수 있어요`}
      </p>

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
          {ENTRIES.map((e) => (
            <button key={e.id} className={styles.card} onClick={() => onOpen(e.id)}>
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
                  <span className={styles.ingredient}>{e.ingredient}</span>
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
