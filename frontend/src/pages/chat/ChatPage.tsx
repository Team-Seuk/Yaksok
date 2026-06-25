/* 대화 모드 = 빈 채팅에서 바로 묻는 독립 화면 (탭 화면, 뒤로가기 없음).
   클로드 시작 화면처럼 비어 있고, 한 줄 물으면 대화가 열린다.
   실제 LLM 연동·세션 저장은 후속 — 지금은 정해진 안내 답으로 흐름만 보여준다. */
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PillImage from '../../components/PillImage'
import { ArrowUp, ChevronRight } from '../../components/icons'
import type { IdentifyResult } from '../../lib/api'
import styles from './ChatPage.module.css'

type Msg = { id: number; role: 'me' | 'bot'; text?: string; image?: string }

/* 카메라 스캔으로 넘어올 때 전달되는 인식 결과 (CameraPage → navigate state). */
type ScanHandoff = { image: string; result: IdentifyResult }

/* 인식 직후 임시 안내 — 실제 상담 답변(LLM)은 팀원3의 guidance 연동으로 대체된다. */
function scanIntro(result: IdentifyResult): string {
  const top = result.candidates[0]?.item_name
  if (top) return `사진 속 약은 ${top}로 보여요. 복용법이나 주의사항 등 궁금한 점을 물어보세요.`
  const a = result.attributes
  const seen = [a.shape, a.color_front].filter(Boolean).join(' · ')
  return seen
    ? `${seen} 형태의 알약으로 보여요. 약 이름이나 증상을 알려주시면 더 자세히 도와드릴게요.`
    : '알약을 살펴봤어요. 궁금한 점을 편하게 물어보세요.'
}

const DEMO_PHOTO = '/demo/pill.jpg'
/* 연출용 — 사진 속 약(타이레놀 500mg)에 대한 프로미 답변(성인 기준). */
const DEMO_ANSWER =
  '보내주신 약은 타이레놀정 500mg (성분: 아세트아미노펜 500mg)으로 보여요. 발열·두통·생리통·근육통 등에 두루 쓰는 해열진통제예요.\n\n' +
  '성인은 보통 1회 1~2정(500~1,000mg)을 4~6시간 간격으로, 필요할 때 복용해요. 하루 최대 4,000mg(8정)을 넘기지 마세요.\n\n' +
  '음주 후에는 복용을 피하고, 종합감기약 등 다른 아세트아미노펜 함유 약과 겹쳐 먹지 않도록 성분을 확인하세요. 간 질환이 있다면 복용 전 의사·약사와 상담하는 게 좋아요.'
const EXAMPLES = ['두통에 먹을 약 알려줘', '빈속에 먹어도 될까?', '졸음이 오는 약이야?']
const BOT_REPLY = '네, 확인해 드릴게요. 약 이름이나 증상을 조금 더 알려주시면 더 정확하게 안내해 드릴게요.'

/* 최근 대화 기록 — 지난 세션 목록(프로토타입: 더미). 탭하면 그 대화로 이어진다. */
type RecentSession = { id: number; title: string; preview: string; when: string }
const RECENT_SESSIONS: RecentSession[] = [
  { id: 1, title: '이지엔6프로연질캡슐', preview: '빈속에 먹어도 되나요?', when: '어제' },
  { id: 2, title: '타이레놀정 500mg', preview: '하루에 몇 알까지 괜찮아요?', when: '6/14' },
  { id: 3, title: '감기약 같이 먹기', preview: '진통제랑 같이 먹어도 되나요?', when: '6/11' },
]

/* 프로미 아바타 — 브랜드 알약을 작은 민트 원 안에 */
const ASSISTANT_LOOK = { kind: 'capsule', color: 'var(--accent)', color2: 'var(--bg-elev)' } as const

export default function ChatPage() {
  const navigate = useNavigate()
  /* 캡처용 스테이징 — 프로미가 응답을 준비하는 타이핑 인디케이터가 고정으로 떠 있다.
       /chat?stage=typing : 증상 텍스트를 보낸 직후 (응답 준비중)
       /chat?stage=photo  : 알약 사진을 첨부해 보낸 직후 (응답 준비중)
       /chat?stage=answer : 사진 첨부 → 프로미가 답변까지 완료 */
  const location = useLocation()
  const stage = new URLSearchParams(location.search).get('stage')
  const stageTyping = stage === 'typing'
  const stagePhoto = stage === 'photo'
  const stageAnswer = stage === 'answer'
  /* 카메라 스캔으로 진입한 경우 — 캡처 사진을 첫 메시지로 띄우고 안내를 잇는다. */
  const scan = (location.state as { scan?: ScanHandoff } | null)?.scan
  const [msgs, setMsgs] = useState<Msg[]>(
    scan
      ? [{ id: 1, role: 'me', image: scan.image }]
      : stageAnswer
        ? [
            { id: 1, role: 'me', image: DEMO_PHOTO },
            { id: 2, role: 'bot', text: DEMO_ANSWER },
          ]
        : stagePhoto
          ? [{ id: 1, role: 'me', image: DEMO_PHOTO }]
          : stageTyping
            ? [{ id: 1, role: 'me', text: '어제부터 머리가 지끈거리고 콧물이 나요.' }]
            : [],
  )
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(stageTyping || stagePhoto || !!scan)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  /* 사용자가 위로 스크롤 중이면 자동 하단 스크롤을 억제하기 위한 추적 */
  const stickToBottom = useRef(true)

  const canSend = draft.trim().length > 0
  const empty = msgs.length === 0

  useEffect(() => {
    if (stickToBottom.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  /* 카메라 스캔으로 진입했으면 사진 메시지 뒤에 안내 답변을 한 번 잇는다(마운트 1회). */
  useEffect(() => {
    if (!scan) return
    const t = setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { id: m.length + 1, role: 'bot', text: scanIntro(scan.result) }])
    }, 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    /* 바닥 근처(여유 48px)면 자동 스크롤 유지, 위로 올렸으면 억제 */
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  function send(text: string) {
    const t = text.trim()
    if (!t) return
    stickToBottom.current = true
    setMsgs((m) => [...m, { id: m.length + 1, role: 'me', text: t }])
    setDraft('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { id: m.length + 1, role: 'bot', text: BOT_REPLY }])
    }, 700)
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
                    <button type="button" className={styles.exampleChip} onClick={() => send(ex)}>
                      {ex}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {RECENT_SESSIONS.length > 0 && (
              <section className={styles.recent} aria-labelledby="chat-recent">
                <h3 id="chat-recent" className={styles.recentHead}>최근 대화</h3>
                <ul className={styles.recentList}>
                  {RECENT_SESSIONS.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={styles.recentCard}
                        onClick={() => navigate(`/conversation/${s.id}`)}
                      >
                        <span className={styles.recentBody}>
                          <span className={styles.recentTitle}>{s.title}</span>
                          <span className={styles.recentPreview}>{s.preview}</span>
                        </span>
                        <span className={styles.recentWhen}>{s.when}</span>
                        <span className={styles.recentChev}><ChevronRight size={18} /></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
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
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(draft)
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
