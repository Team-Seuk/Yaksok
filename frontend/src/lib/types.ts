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

/** medications — health_profiles 1:N (복용약 목록) */
export interface Medication {
  id: ID
  profileId: ID // FK → HealthProfile.id
  name: string
}

/** allergies — health_profiles 1:N (알레르기 목록) */
export interface Allergy {
  id: ID
  profileId: ID // FK → HealthProfile.id
  name: string
}
