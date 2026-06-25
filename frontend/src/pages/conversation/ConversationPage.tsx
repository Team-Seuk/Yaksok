import { useState } from 'react'
import { ChevronLeft, ArrowUp } from '../../components/icons'
import styles from './ConversationPage.module.css'

/* 개별 대화 화면 = 한 약(또는 새 질문)에 대한 메시지 말풍선 + 입력 (프로토타입: 더미).
   ERD의 conversations·messages에 대응. 서버 연동은 M4. */
type Msg = { id: number; role: 'me' | 'bot'; text: string }

const SEED: Msg[] = [
  { id: 1, role: 'me', text: '공복에 먹어도 되나요?' },
  {
    id: 2,
    role: 'bot',
    text: '위장 자극이 적은 편이지만 속이 예민하면 식후 30분에 드시는 걸 권해요.\n지금 21시라면 다음 날 아침 속쓰림을 줄이려 가벼운 음식과 함께 드세요.',
  },
]

export default function ConversationPage({ onBack }: { onBack: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>(SEED)
  const [draft, setDraft] = useState('')

  const canSend = draft.trim().length > 0

  function send() {
    const text = draft.trim()
    if (!text) return
    setMsgs((m) => [...m, { id: m.length + 1, role: 'me', text }])
    setDraft('')
  }

  return (
    <div className="result">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="뒤로">
          <ChevronLeft />
        </button>
        <span className={styles.headBody}>
          <span className={styles.headName}>이지엔6프로연질캡슐</span>
          <span className={styles.headSub}>이 약에 대한 대화</span>
        </span>
      </div>

      <div className={`result-scroll ${styles.scroll}`}>
        <div className={styles.list}>
          {msgs.map((m) => {
            const me = m.role === 'me'
            return (
              <div
                key={m.id}
                className={`${styles.row}${me ? ` ${styles.rowMe}` : ''}`}
                role="article"
                aria-label={me ? '내 메시지' : '프로미의 메시지'}
              >
                <span className={styles.who}>{me ? '나' : '프로미'}</span>
                <div className={`${styles.bubble} ${me ? styles.bubbleMe : styles.bubbleBot}`}>
                  {m.text}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <form
        className={`composer ${styles.composer}`}
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          className="input"
          placeholder="이 약에 대해 물어보기"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="메시지 입력"
        />
        <button className="send" type="submit" aria-label="보내기" disabled={!canSend}>
          <ArrowUp />
        </button>
      </form>
    </div>
  )
}
