/* 내 알약사전(내 기록) — 그동안 알아본 약을 사전처럼 모은 목록.
   localStorage(yaksok:cabinet)에 영속한다(이 앱의 1인용 저장소 = 기기 localStorage, 계정 없음).
   처음엔 기본 약으로 시드되고, 카메라로 약을 인식하면 addToCabinet 으로 쌓인다.
   알약사전 화면과 '오늘의 약속' 편집의 '내 사전에서 가져오기'가 같은 소스를 쓴다. */
import type { PillKind, PillLook } from '../components/PillImage'

export type CabinetEntry = {
  id: number
  /** 식약처 품목기준코드 — 실제 인식으로 쌓인 약이면 있음(중복 판정·상세 연결용). */
  itemSeq?: string
  name: string
  ingredient: string
  category: string
  summary: string
  look: PillLook
}

const CABINET_KEY = 'yaksok:cabinet'

/** 저장된 게 없을 때 보여줄 기본 약(시드). 사용자가 약을 인식/조작하면 실제 목록으로 저장된다. */
const DEFAULT_CABINET: CabinetEntry[] = [
  { id: 1, name: '이지엔6프로연질캡슐', ingredient: '덱시부프로펜 300mg', category: '소염진통제', summary: '생리통·두통·치통에 쓰는 비스테로이드성 진통제. 위장 자극이 적은 편이에요.', look: { kind: 'oval', color: '#d6464f' } },
  { id: 2, name: '타이레놀정 500mg', ingredient: '아세트아미노펜 500mg', category: '해열진통제', summary: '발열·두통에 두루 쓰는 진통제. 하루 4g을 넘기지 않도록 주의해요.', look: { kind: 'caplet', color: '#eef0f2' } },
  { id: 3, name: '계보린정', ingredient: '아세트아미노펜·카페인 복합', category: '복합 진통제', summary: '카페인이 함유돼 야간 복용 시 수면을 방해할 수 있어요.', look: { kind: 'round', color: '#ece6e0' } },
  { id: 4, name: '베아제정', ingredient: '소화효소 복합', category: '소화제', summary: '과식·더부룩함에 쓰는 소화효소제. 식후에 복용해요.', look: { kind: 'round', color: '#f3d9a0' } },
]

/** 내 사전 목록 — 저장된 게 있으면 그것, 없으면 기본 약. */
export function loadCabinet(): CabinetEntry[] {
  const raw = localStorage.getItem(CABINET_KEY)
  if (raw === null) return DEFAULT_CABINET
  try {
    const parsed = JSON.parse(raw) as CabinetEntry[]
    return Array.isArray(parsed) ? parsed : DEFAULT_CABINET
  } catch {
    return DEFAULT_CABINET
  }
}

function saveCabinet(entries: CabinetEntry[]): void {
  localStorage.setItem(CABINET_KEY, JSON.stringify(entries))
}

export type NewCabinetEntry = Omit<CabinetEntry, 'id'>

/** 약 한 건을 내 사전에 추가(맨 앞). 같은 약(itemSeq·없으면 이름)은 최신으로 끌어올린다. 갱신된 목록 반환. */
export function addToCabinet(entry: NewCabinetEntry): CabinetEntry[] {
  const current = loadCabinet()
  const key = entry.itemSeq ?? entry.name
  const without = current.filter((e) => (e.itemSeq ?? e.name) !== key)
  const id = Math.max(0, ...current.map((e) => e.id)) + 1
  const next = [{ ...entry, id }, ...without].slice(0, 50)
  saveCabinet(next)
  return next
}

/** id로 내 사전에서 제거. 갱신된 목록 반환. */
export function removeFromCabinet(id: number): CabinetEntry[] {
  const next = loadCabinet().filter((e) => e.id !== id)
  saveCabinet(next)
  return next
}

/* 식약처 모양·색(한글) → 알약 일러스트 look. 미상은 캡슐·중립색으로. */
const SHAPE_KIND: Record<string, PillKind> = { 원형: 'round', 타원형: 'oval', 장방형: 'caplet' }
const COLOR_HEX: Record<string, string> = {
  하양: '#eef0f2', 노랑: '#f3d9a0', 주황: '#e8a05a', 분홍: '#f3c4c4', 빨강: '#d6464f',
  갈색: '#b08968', 연두: '#cfe3a6', 초록: '#a9d2b0', 청록: '#9fd2cf', 파랑: '#9db8e0',
  남색: '#7f8fc0', 자주: '#c08bbf', 보라: '#b3a3da', 회색: '#cfd4d8', 검정: '#6b7177', 투명: '#e7ecee',
}

export function lookFrom(shape: string | null, color: string | null): PillLook {
  return {
    kind: (shape && SHAPE_KIND[shape]) || 'capsule',
    color: (color && COLOR_HEX[color]) || '#dfe5e7',
  }
}
