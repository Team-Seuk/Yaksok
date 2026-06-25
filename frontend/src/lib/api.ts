/* 백엔드 API 클라이언트.
   현재 쓰는 엔드포인트: POST /api/pill/identify (사진 → 속성 추출 + 후보 약).
   서버에 GOOGLE_API_KEY 가 없으면 백엔드가 fake Vision 으로 응답하므로,
   키 발급 전에도 이 경로로 흐름 전체를 확인할 수 있다. */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

/** Vision 이 추출한 식별 속성(식약처 표기). 모르는 값은 null. */
export interface IdentifiedAttributes {
  shape: string | null
  color_front: string | null
  color_back: string | null
  imprint_front: string | null
  imprint_back: string | null
  line_front: string | null
  line_back: string | null
  form: string | null
}

/** 매칭 후보 약 한 건 (score 높을수록 일치). */
export interface PillCandidate {
  item_seq: string
  item_name: string
  entp_name: string | null
  shape: string | null
  color_front: string | null
  color_back: string | null
  print_front: string | null
  print_back: string | null
  image_url: string | null
  is_otc: boolean | null
  score: number
}

export interface IdentifyResponse {
  attributes: IdentifiedAttributes
  candidates: PillCandidate[]
  /** 후보 0개이거나 최고 점수가 낮아 재촬영을 권하는지. */
  needs_retry: boolean
  /** 재촬영 안내 등 사용자에게 보여줄 메시지. */
  message: string | null
}

/** API 호출 실패. status=0 은 네트워크 단절(서버 미기동 등). */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// ── Guidance (복약 상담) ──────────────────────────────────────────

export interface HealthInfoPayload {
  allergies?: string[]
  is_pregnant?: boolean
  is_breastfeeding?: boolean
  conditions?: string[]
  current_medications?: string[]
  age?: number
  sex?: string // "M" | "F" | "other"
}

export interface ConversationResponse {
  id: string
  created_at: string
}

export interface MessageResponse {
  id: string
  role: string
  content: string
  created_at: string
}

/** 새 대화방을 만든다. */
export async function createConversation(): Promise<ConversationResponse> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/guidance/conversations`, { method: 'POST' })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new ApiError(res.status, body?.detail ?? `요청 실패 (${res.status})`)
  }
  return (await res.json()) as ConversationResponse
}

/** 대화방에 메시지를 보내고 AI 답변을 받는다. */
export async function sendMessage(
  conversationId: string,
  message: string,
  healthInfo?: HealthInfoPayload,
): Promise<MessageResponse> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/guidance/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, health_info: healthInfo ?? {} }),
    })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new ApiError(res.status, body?.detail ?? `요청 실패 (${res.status})`)
  }
  return (await res.json()) as MessageResponse
}

/** 대화방의 메시지 내역을 가져온다. */
export async function getMessages(conversationId: string): Promise<MessageResponse[]> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/guidance/conversations/${conversationId}/messages`)
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new ApiError(res.status, body?.detail ?? `요청 실패 (${res.status})`)
  }
  return (await res.json()) as MessageResponse[]
}

// ── Pill identify ─────────────────────────────────────────────────

/** 알약 사진을 보내 식별 결과를 받는다. file 은 카메라 캡처 Blob 또는 업로드 File. */
export async function identifyPill(file: Blob): Promise<IdentifyResponse> {
  const form = new FormData()
  form.append('file', file, 'pill.jpg')

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/pill/identify`, { method: 'POST', body: form })
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요. 백엔드가 실행 중인지 확인해 주세요.')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new ApiError(res.status, body?.detail ?? `요청 실패 (${res.status})`)
  }
  return (await res.json()) as IdentifyResponse
}

/* ── 알약사전(검색·목록·상세) ───────────────────────────── */

/** 목록/검색 항목(요약). 식약처 표기. */
export interface PillSummary {
  item_seq: string
  item_name: string
  entp_name: string | null
  is_otc: boolean | null
  shape: string | null
  color_front: string | null
  color_back: string | null
  class_name: string | null
  image_url: string | null
}

/** 상세 = 요약 + 각인·제형·효능·용법·주의. */
export interface PillDetailInfo extends PillSummary {
  print_front: string | null
  print_back: string | null
  form: string | null
  efcy: string | null
  use_method: string | null
  caution: string | null
}

/** GET 요청 공통 처리(연결 실패·HTTP 오류를 ApiError 로). */
async function getJson<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`)
  } catch {
    throw new ApiError(0, '서버에 연결할 수 없어요. 백엔드가 실행 중인지 확인해 주세요.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null
    throw new ApiError(res.status, body?.detail ?? `요청 실패 (${res.status})`)
  }
  return (await res.json()) as T
}

/** 알약 목록/검색. q 가 비면 전체(최대 limit). */
export async function listPills(q = '', limit = 30): Promise<PillSummary[]> {
  const params = new URLSearchParams()
  if (q.trim()) params.set('q', q.trim())
  params.set('limit', String(limit))
  return getJson<PillSummary[]>(`/api/pill/dictionary?${params.toString()}`)
}

/** 품목기준코드로 알약 상세 1건. 없으면 ApiError(404). */
export async function getPillDetail(itemSeq: string): Promise<PillDetailInfo> {
  return getJson<PillDetailInfo>(`/api/pill/dictionary/${encodeURIComponent(itemSeq)}`)
}
