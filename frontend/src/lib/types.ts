/* ERD(docs/ERD.md)를 TypeScript 타입으로 옮긴 것.
   프로토타입은 서버/DB 없이 localStorage에 저장하므로, FK는 DB 제약이 아니라
   "다른 레코드의 id를 가리키는 숫자"(논리 참조)로 표현한다. */

export type ID = number

/** users — 계정. 프로토타입은 인증 미구현 → 시드 dev 유저 1명만 사용. */
export interface User {
  id: ID
  email: string
  nickname: string | null
}

/** health_profiles — users 1:1 (한 유저당 건강정보 1개)
   birthYear·sex·임신/수유는 필수 입력. 아래 3개(혈압·병력·BMI)는 선택 입력으로,
   건강검진 등 문서 촬영으로 자동 채우거나 사용자가 직접 입력한다. */
export interface HealthProfile {
  id: ID
  userId: ID // FK → User.id
  birthYear: number | null
  sex: 'M' | 'F' | 'other'
  isPregnant: boolean
  isBreastfeeding: boolean
  bloodPressure: string | null // 선택 · 예: "120/80"
  medicalHistory: string | null // 선택 · 병력(자유 입력)
  bmi: number | null // 선택
}

/** 복용 시점 — 하루 중 언제 */
export type DoseWhen = '아침' | '점심' | '저녁' | '자기 전'
/** 식사 기준 타이밍 */
export type DoseTiming = '식전' | '식후' | '공복' | '취침 전'

/** medications — health_profiles 1:N (복용약 목록)
   복용 스케줄(when·timing·perDay·dose)은 프로토타입에서 '오늘의 약속' 편집으로 채운다.
   기존 데이터 호환을 위해 전부 선택 필드 — 없으면 '미설정'으로 본다. */
export interface Medication {
  id: ID
  profileId: ID // FK → HealthProfile.id
  name: string
  when?: DoseWhen // 복용 시점(아침/점심/저녁/자기 전)
  timing?: DoseTiming // 식전/식후/공복/취침 전
  perDay?: number // 하루 복용 횟수
  dose?: number // 1회 복용 정 수
}

/** allergies — health_profiles 1:N (알레르기 목록) */
export interface Allergy {
  id: ID
  profileId: ID // FK → HealthProfile.id
  name: string
}
