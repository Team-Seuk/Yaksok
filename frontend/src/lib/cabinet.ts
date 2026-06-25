/* 내 알약사전 — 대화 중 언급된 약을 사전처럼 모은 목록(프로토타입: 더미).
   알약사전 화면과 '오늘의 약속' 편집의 '내 사전에서 가져오기'가 같은 소스를 쓴다. */
import type { PillLook } from '../components/PillImage'

export type CabinetEntry = {
  id: number
  name: string
  ingredient: string
  category: string
  summary: string
  look: PillLook
}

export const CABINET_ENTRIES: CabinetEntry[] = [
  { id: 1, name: '이지엔6프로연질캡슐', ingredient: '덱시부프로펜 300mg', category: '소염진통제', summary: '생리통·두통·치통에 쓰는 비스테로이드성 진통제. 위장 자극이 적은 편이에요.', look: { kind: 'oval', color: '#d6464f' } },
  { id: 2, name: '타이레놀정 500mg', ingredient: '아세트아미노펜 500mg', category: '해열진통제', summary: '발열·두통에 두루 쓰는 진통제. 하루 4g을 넘기지 않도록 주의해요.', look: { kind: 'caplet', color: '#eef0f2' } },
  { id: 3, name: '계보린정', ingredient: '아세트아미노펜·카페인 복합', category: '복합 진통제', summary: '카페인이 함유돼 야간 복용 시 수면을 방해할 수 있어요.', look: { kind: 'round', color: '#ece6e0' } },
  { id: 4, name: '베아제정', ingredient: '소화효소 복합', category: '소화제', summary: '과식·더부룩함에 쓰는 소화효소제. 식후에 복용해요.', look: { kind: 'round', color: '#f3d9a0' } },
]
