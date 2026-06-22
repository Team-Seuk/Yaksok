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
