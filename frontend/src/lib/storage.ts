import type { HealthProfile, Medication, Allergy, ID } from './types'

/* 프로토타입 저장소 — 서버 대신 localStorage.
   인증 미구현이라 시드 dev 유저(id=1)·프로필(id=1)에 모든 데이터를 묶는다. */
export const DEV_USER_ID: ID = 1
export const DEV_PROFILE_ID: ID = 1

const HEALTH_KEY = 'yaksok:health'

/** 건강정보 한 묶음 (profile + 그에 속한 1:N 목록들) */
export interface HealthBundle {
  profile: HealthProfile
  medications: Medication[]
  allergies: Allergy[]
}

export function loadHealth(): HealthBundle | null {
  const raw = localStorage.getItem(HEALTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as HealthBundle
  } catch {
    return null
  }
}

export function saveHealth(bundle: HealthBundle): void {
  localStorage.setItem(HEALTH_KEY, JSON.stringify(bundle))
}

export function hasHealth(): boolean {
  return localStorage.getItem(HEALTH_KEY) !== null
}

/** medications가 비었을 때 홈·편집이 공유하는 기본 약(스케줄 포함).
   사용자가 편집에서 손대면 실제 medications로 저장된다. */
export const DEFAULT_MEDICATIONS: Medication[] = [
  { id: 1, profileId: DEV_PROFILE_ID, name: '타이레놀정 500mg', when: '아침', timing: '식후', perDay: 1, dose: 1 },
  { id: 2, profileId: DEV_PROFILE_ID, name: '이지엔6프로', when: '점심', timing: '식후', perDay: 1, dose: 1 },
]

/** 복용약 목록 — 저장된 게 있으면 그것, 없으면 기본 약.
   홈과 '오늘의 약속' 편집이 같은 목록을 보도록 한 곳에서 푼다. */
export function loadMedications(): Medication[] {
  const meds = loadHealth()?.medications
  return meds && meds.length > 0 ? meds : DEFAULT_MEDICATIONS
}
