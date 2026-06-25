/* 개별 대화 화면 — 한 약(또는 새 질문)에 대한 메시지 말풍선 + 입력. */
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ArrowUp } from '../../components/icons'
import styles from './ConversationPage.module.css'
import { getMessages, sendMessage, ApiError, type MessageResponse, type HealthInfoPayload } from '../../lib/api'
import { loadHealth } from '../../lib/storage'

type Msg = { id: string; role: 'me' | 'bot'; text: string }

function buildHealthInfo(): HealthInfoPayload {
  const bundle = loadHealth()
  if (!bundle) return {}
  return {
    allergies: bundle.allergies.map((a) => a.name),
    is_pregnant: bundle.profile.isPregnant,
    is_breastfeeding: bundle.profile.isBreastfeeding,
    current_medications: bundle.medications.map((m) => m.name),
  }
}

function toMsg(m: MessageResponse): Msg {
  return { id: m.id, role: m.role === 'user' ? 'me' : 'bot', text: m.content }
}

export default function ConversationPage({
  conversationId,
  title,
  onBack,
}: {
  conversationId: string
  title?: string
  onBack: () => void
}) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMessages(conversationId)
      .then((list) => setMsgs(list.map(toMsg)))
      .catch((e) => {
        const msg = e instanceof ApiError ? e.message : '내역을 불러오지 못했어요.'
        setError(msg)
      })
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  const canSend = draft.trim().length > 0

  async function send() {
    const text = draft.trim()
    if (!text) return
    setMsgs((m) => [...m, { id: `tmp-${Date.now()}`, role: 'me', text }])
    setDraft('')
    setTyping(true)
    setError(null)

    try {
      const reply = await sendMessage(conversationId, text, buildHealthInfo())
      setTyping(false)
      setMsgs((m) => [...m, toMsg(reply)])
    } catch (e) {
      setTyping(false)
      const msg = e instanceof ApiError ? e.message : '오류가 발생했어요. 다시 시도해 주세요.'
      setError(msg)
    }
  }

  return (
    <div className="result">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="뒤로">
          <ChevronLeft />
        </button>
        <span className={styles.headBody}>
          <span className={styles.headName}>{title ?? '상담'}</span>
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
          {typing && (
            <div className={styles.row} role="status" aria-label="프로미가 입력 중입니다">
              <span className={styles.who}>프로미</span>
              <div className={`${styles.bubble} ${styles.bubbleBot}`}>…</div>
            </div>
          )}
          {error && (
            <div className={styles.row} role="alert">
              <div className={`${styles.bubble} ${styles.bubbleBot}`} style={{ color: 'var(--danger, #e55)' }}>
                {error}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        className={`composer ${styles.composer}`}
        onSubmit={(e) => {
          e.preventDefault()
          void send()
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
