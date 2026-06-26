/* 대화 모드 = 빈 채팅에서 바로 묻는 독립 화면 (탭 화면, 뒤로가기 없음). */
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PillImage from '../../components/PillImage'
import { ArrowUp } from '../../components/icons'
import type { IdentifyResponse } from '../../lib/api'
import styles from './ChatPage.module.css'
import {
  createConversation,
  sendMessage,
  identifyPill,
  ApiError,
  type HealthInfoPayload,
} from '../../lib/api'
import { loadHealth } from '../../lib/storage'

type Msg = { id: number; role: 'me' | 'bot'; text?: string; image?: string }

/* 카메라 스캔으로 넘어올 때 전달되는 캡처 사진 (CameraPage → navigate state).
   인식(비전 호출)은 이 화면에서 수행한다. */
type ScanHandoff = { image: string }

/* 인식 직후 임시 안내 — 실제 상담 답변(LLM)은 팀원3의 guidance 연동으로 대체된다. */
function scanIntro(result: IdentifyResponse): string {
  const top = result.candidates[0]?.item_name
  if (top) return `사진 속 약은 ${top}로 보여요. 복용법이나 주의사항 등 궁금한 점을 물어보세요.`
  const a = result.attributes
  const seen = [a.shape, a.color_front].filter(Boolean).join(' · ')
  return seen
    ? `${seen} 형태의 알약으로 보여요. 약 이름이나 증상을 알려주시면 더 자세히 도와드릴게요.`
    : '알약을 살펴봤어요. 궁금한 점을 편하게 물어보세요.'
}

const DEMO_PHOTO = '/demo/pill.jpg'
const EXAMPLES = ['두통에 먹을 약 알려줘', '빈속에 먹어도 될까?', '졸음이 오는 약이야?']

/* 프로미 아바타 — 브랜드 알약을 작은 민트 원 안에 */
const ASSISTANT_LOOK = { kind: 'capsule', color: 'var(--accent)', color2: 'var(--bg-elev)' } as const

/** localStorage 건강정보 → API payload 변환 */
function buildHealthInfo(): HealthInfoPayload {
  const bundle = loadHealth()
  if (!bundle) return {}
  const by = bundle.profile.birthYear
  return {
    allergies: bundle.allergies.map((a) => a.name),
    is_pregnant: bundle.profile.isPregnant,
    is_breastfeeding: bundle.profile.isBreastfeeding,
    current_medications: bundle.medications.map((m) => m.name),
    conditions: bundle.profile.medicalHistory
      ? bundle.profile.medicalHistory.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    age: by ? new Date().getFullYear() - by : undefined,
    sex: bundle.profile.sex,
  }
}

export default function ChatPage() {
  const location = useLocation()
  const stage = new URLSearchParams(location.search).get('stage')
  const stageTyping = stage === 'typing'
  const stagePhoto = stage === 'photo'
  /* 카메라 스캔으로 진입한 경우 — 캡처 사진을 첫 메시지로 띄우고 안내를 잇는다. */
  const scan = (location.state as { scan?: ScanHandoff } | null)?.scan
  const [msgs, setMsgs] = useState<Msg[]>(
    scan
      ? [{ id: 1, role: 'me', image: scan.image }]
      : stagePhoto
        ? [{ id: 1, role: 'me', image: DEMO_PHOTO }]
        : stageTyping
          ? [{ id: 1, role: 'me', text: '어제부터 머리가 지끈거리고 콧물이 나요.' }]
          : [],
  )
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(stageTyping || stagePhoto || !!scan)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)

  const canSend = draft.trim().length > 0
  const empty = msgs.length === 0

  useEffect(() => {
    if (stickToBottom.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  /* 카메라 스캔으로 진입 — 캡처 사진을 비전 모델로 보내 인식하고 결과 안내를 잇는다(마운트 1회). */
  useEffect(() => {
    if (!scan) return
    let alive = true
    ;(async () => {
      try {
        const blob = await (await fetch(scan.image)).blob()
        const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' })
        const result = await identifyPill(file)
        if (!alive) return
        setTyping(false)
        setMsgs((m) => [...m, { id: m.length + 1, role: 'bot', text: scanIntro(result) }])
      } catch (e) {
        if (!alive) return
        setTyping(false)
        setError(e instanceof ApiError ? e.message : '사진을 인식하지 못했어요. 다시 찍어 주세요.')
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  async function send(text: string) {
    const t = text.trim()
    if (!t) return
    stickToBottom.current = true
    setMsgs((m) => [...m, { id: m.length + 1, role: 'me', text: t }])
    setDraft('')
    setTyping(true)
    setError(null)

    try {
      let convId = conversationId
      if (!convId) {
        const conv = await createConversation()
        convId = conv.id
        setConversationId(convId)
      }

      const reply = await sendMessage(convId, t, buildHealthInfo())
      setTyping(false)
      setMsgs((m) => [...m, { id: m.length + 1, role: 'bot', text: reply.content }])
    } catch (e) {
      setTyping(false)
      const msg = e instanceof ApiError ? e.message : '오류가 발생했어요. 다시 시도해 주세요.'
      setError(msg)
    }
  }

  return (
    <div className="result">
      <header className={styles.head}>
        <h1 className={styles.headTitle}>대화</h1>
        <p className={styles.headSub}>채팅으로 알아보기</p>
      </header>

      <div
        className={`result-scroll ${styles.scroll}${empty ? ` ${styles.noScroll}` : ''}`}
        ref={scrollRef}
        onScroll={onScroll}
      >
        {empty ? (
          <div className={styles.empty}>
            <div className={styles.intro}>
              <span className={styles.emptyAvatar} aria-hidden="true">
                <PillImage look={ASSISTANT_LOOK} size={30} />
              </span>
              <div className={styles.emptyText}>
                <h2 className={styles.emptyTitle}>무엇이든 편하게 물어보세요</h2>
                <p className={styles.emptySub}>약 이름, 증상, 복약 시간 — 떠오르는 대로 적어 주세요.</p>
              </div>
              <ul className={styles.examples}>
                {EXAMPLES.map((ex) => (
                  <li key={ex}>
                    <button type="button" className={styles.exampleChip} onClick={() => void send(ex)}>
                      {ex}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
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
                  {!me && (
                    <span className={styles.avatar} aria-hidden="true">
                      <PillImage look={ASSISTANT_LOOK} size={20} />
                    </span>
                  )}
                  {m.image ? (
                    <img className={styles.photo} src={m.image} alt="첨부한 알약 사진" />
                  ) : (
                    <div className={`${styles.bubble} ${me ? styles.bubbleMe : styles.bubbleBot}`}>{m.text}</div>
                  )}
                </div>
              )
            })}
            {typing && (
              <div className={styles.row} role="status" aria-label="프로미가 입력 중입니다">
                <span className={styles.avatar} aria-hidden="true">
                  <PillImage look={ASSISTANT_LOOK} size={20} />
                </span>
                <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typing}`} aria-hidden="true">
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
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
        )}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          void send(draft)
        }}
      >
        <input
          className="input"
          placeholder="프로미에게 물어보기"
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
