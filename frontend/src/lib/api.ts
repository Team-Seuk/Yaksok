const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export interface IdentifyAttributes {
  shape: string | null
  color_front: string | null
  color_back: string | null
  imprint_front: string | null
  imprint_back: string | null
  line_front: string | null
  line_back: string | null
  form: string | null
}

export interface IdentifyCandidate {
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

export interface IdentifyResult {
  attributes: IdentifyAttributes
  candidates: IdentifyCandidate[]
  needs_retry: boolean
  message: string | null
}

export async function identifyPill(file: File): Promise<IdentifyResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/api/pill/identify`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`인식 실패 (${res.status})`)
  return res.json() as Promise<IdentifyResult>
}
