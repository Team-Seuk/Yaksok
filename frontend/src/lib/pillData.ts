/* 알약사전 더미 데이터. 실제 데이터셋이 들어오면 이 파일만 교체하면 된다. */
import type { PillLook } from '../components/PillImage'

export type PillDetail = {
  id: number
  name: string
  ingredient: string
  category: string
  look: PillLook
  manufacturer: string
  shape: string
  color: string
  summary: { label: string; value: string }[]
  cautions: string[]
}

export const PILLS: PillDetail[] = [
  {
    id: 1,
    name: '이지엔6프로연질캡슐',
    ingredient: '덱시부프로펜 300mg',
    category: '소염진통제',
    look: { kind: 'oval', color: '#d6464f' },
    manufacturer: '대웅제약',
    shape: '타원형',
    color: '빨강',
    summary: [
      { label: '용법', value: '1회 1~2정 · 4~6시간 간격으로' },
      { label: '용량', value: '하루 최대 4g 이하로 지켜 주세요' },
      { label: '복용 시점', value: '식후 30분에 드시면 편해요' },
    ],
    cautions: [
      '위장이 예민하면 빈속 복용을 피해 주세요.',
      '다른 소염진통제와 함께 먹지 마세요.',
      '증상이 3일 넘게 이어지면 약사·의사와 상담하세요.',
    ],
  },
  {
    id: 2,
    name: '타이레놀정 500mg',
    ingredient: '아세트아미노펜 500mg',
    category: '해열진통제',
    look: { kind: 'caplet', color: '#eef0f2' },
    manufacturer: '한국얀센',
    shape: '장방형',
    color: '흰색',
    summary: [
      { label: '용법', value: '1회 1~2정 · 4~6시간 간격으로' },
      { label: '용량', value: '하루 최대 4g 이하로 지켜 주세요' },
      { label: '복용 시점', value: '식전·식후 관계없이 복용 가능해요' },
    ],
    cautions: [
      '하루 4g(정 8개)를 절대 넘기지 마세요.',
      '음주 중이거나 간 질환이 있으면 의사와 상담 후 복용하세요.',
      '다른 아세트아미노펜 제품과 함께 복용하지 마세요.',
    ],
  },
  {
    id: 3,
    name: '게보린정',
    ingredient: '아세트아미노펜·카페인 복합',
    category: '복합 진통제',
    look: { kind: 'round', color: '#ece6e0' },
    manufacturer: '삼진제약',
    shape: '원형',
    color: '미색',
    summary: [
      { label: '용법', value: '1회 1정 · 하루 3회' },
      { label: '용량', value: '하루 3정을 초과하지 마세요' },
      { label: '복용 시점', value: '식후 30분에 복용하세요' },
    ],
    cautions: [
      '카페인이 함유돼 야간 복용 시 수면을 방해할 수 있어요.',
      '커피·에너지드링크와 함께 마시면 카페인 과다 섭취가 될 수 있어요.',
      '15세 미만 어린이는 복용하지 마세요.',
    ],
  },
  {
    id: 4,
    name: '베아제정',
    ingredient: '소화효소 복합',
    category: '소화제',
    look: { kind: 'round', color: '#f3d9a0' },
    manufacturer: '대웅제약',
    shape: '원형',
    color: '노란색',
    summary: [
      { label: '용법', value: '1회 1~2정 · 하루 3회' },
      { label: '용량', value: '1회 2정을 초과하지 마세요' },
      { label: '복용 시점', value: '식사 직후에 복용하세요' },
    ],
    cautions: [
      '과식·더부룩함에 쓰는 소화효소제예요.',
      '급성 췌장염이 있는 경우 복용을 피하세요.',
      '증상이 지속되면 전문가 상담을 받으세요.',
    ],
  },
  {
    id: 5,
    name: '겔포스엠현탁액',
    ingredient: '인산알루미늄겔 등',
    category: '제산제',
    look: { kind: 'capsule', color: '#bfe3df', color2: '#ffffff' },
    manufacturer: '보령제약',
    shape: '현탁액',
    color: '흰색',
    summary: [
      { label: '용법', value: '1회 1포 · 하루 3~4회' },
      { label: '용량', value: '하루 4포를 초과하지 마세요' },
      { label: '복용 시점', value: '식간(식사 1~2시간 후) 또는 취침 전' },
    ],
    cautions: [
      '신장 기능이 저하된 분은 복용 전 의사와 상담하세요.',
      '변비가 생길 수 있어요.',
      '다른 약과 2시간 간격을 두고 복용하세요.',
    ],
  },
  {
    id: 6,
    name: '판콜에이내복액',
    ingredient: '아세트아미노펜 등 복합',
    category: '종합감기약',
    look: { kind: 'capsule', color: '#c98a3a', color2: '#f0d9b5' },
    manufacturer: '동화약품',
    shape: '액제',
    color: '갈색',
    summary: [
      { label: '용법', value: '1회 1병 · 하루 3회' },
      { label: '용량', value: '하루 3병을 초과하지 마세요' },
      { label: '복용 시점', value: '식후에 복용하세요' },
    ],
    cautions: [
      '졸음이 올 수 있으니 운전 시 주의하세요.',
      '음주 중에는 복용하지 마세요.',
      '다른 감기약·진통제와 중복 복용하지 마세요.',
    ],
  },
  {
    id: 7,
    name: '지르텍정',
    ingredient: '세티리진염산염 10mg',
    category: '항히스타민제',
    look: { kind: 'round', color: '#dfe7ef' },
    manufacturer: '한국UCB제약',
    shape: '원형',
    color: '흰색',
    summary: [
      { label: '용법', value: '1회 1정 · 하루 1회' },
      { label: '용량', value: '하루 1정을 초과하지 마세요' },
      { label: '복용 시점', value: '취침 전에 복용하면 좋아요' },
    ],
    cautions: [
      '졸음이 올 수 있으니 운전·기계 조작 시 주의하세요.',
      '신장 기능이 저하된 경우 용량 조절이 필요해요.',
      '알코올과 함께 복용하면 졸음이 심해질 수 있어요.',
    ],
  },
  {
    id: 8,
    name: '에어탈정',
    ingredient: '아세클로페낙 100mg',
    category: '소염진통제',
    look: { kind: 'round', color: '#f4f1ea' },
    manufacturer: '대웅제약',
    shape: '원형',
    color: '흰색',
    summary: [
      { label: '용법', value: '1회 1정 · 하루 2회' },
      { label: '용량', value: '하루 2정을 초과하지 마세요' },
      { label: '복용 시점', value: '식후에 복용하세요' },
    ],
    cautions: [
      '위장장애가 있을 수 있으니 식후 복용을 권장해요.',
      '소화성 궤양 병력이 있으면 복용 전 의사와 상담하세요.',
      '장기 복용 시 정기적인 검진이 필요해요.',
    ],
  },
  {
    id: 9,
    name: '무코스타정',
    ingredient: '레바미피드 100mg',
    category: '위점막보호제',
    look: { kind: 'round', color: '#f0e2b8' },
    manufacturer: '오츠카제약',
    shape: '원형',
    color: '연노랑',
    summary: [
      { label: '용법', value: '1회 1정 · 하루 3회' },
      { label: '용량', value: '의사 처방에 따라 복용하세요' },
      { label: '복용 시점', value: '식후 30분·취침 전에 복용하세요' },
    ],
    cautions: [
      '위점막을 보호하는 약이에요.',
      '임신 중이거나 수유 중인 경우 의사와 상담하세요.',
      '증상이 개선되어도 임의로 중단하지 마세요.',
    ],
  },
  {
    id: 10,
    name: '신신파스아렉스',
    ingredient: '멘톨·살리실산메틸 등',
    category: '외용 진통소염',
    look: { kind: 'caplet', color: '#e7eef0' },
    manufacturer: '신신제약',
    shape: '패치형',
    color: '흰색',
    summary: [
      { label: '용법', value: '환부에 1장 붙여 사용' },
      { label: '용량', value: '하루 1~2회 교체하세요' },
      { label: '복용 시점', value: '필요 시 환부에 직접 부착' },
    ],
    cautions: [
      '상처·습진이 있는 피부에는 사용하지 마세요.',
      '발진·가려움증이 생기면 즉시 떼고 사용을 중단하세요.',
      '눈·점막에 닿지 않도록 주의하세요.',
    ],
  },
  {
    id: 11,
    name: '훼스탈플러스정',
    ingredient: '판크레아틴 등 소화효소',
    category: '소화제',
    look: { kind: 'round', color: '#e9d6c2' },
    manufacturer: '한독',
    shape: '원형',
    color: '갈색',
    summary: [
      { label: '용법', value: '1회 1~2정 · 하루 3회' },
      { label: '용량', value: '1회 2정을 초과하지 마세요' },
      { label: '복용 시점', value: '식사 중 또는 식사 직후' },
    ],
    cautions: [
      '급성 췌장염 또는 만성 췌장염 급성기에는 복용하지 마세요.',
      '돼지 단백질 알레르기가 있는 경우 주의하세요.',
      '씹지 말고 통째로 삼켜 주세요.',
    ],
  },
  {
    id: 12,
    name: '아스피린프로텍트정',
    ingredient: '아세틸살리실산 100mg',
    category: '항혈전·진통',
    look: { kind: 'round', color: '#f4f4f2' },
    manufacturer: '바이엘코리아',
    shape: '원형',
    color: '흰색',
    summary: [
      { label: '용법', value: '1회 1정 · 하루 1회' },
      { label: '용량', value: '의사 처방에 따라 복용하세요' },
      { label: '복용 시점', value: '식후에 복용하세요' },
    ],
    cautions: [
      '출혈 경향이 있는 분은 의사와 상담 후 복용하세요.',
      '수술 예정이라면 최소 1주일 전에 의사에게 알리세요.',
      '임의로 중단하지 말고 의사와 상담하세요.',
    ],
  },
]

export function getPillById(id: number): PillDetail | undefined {
  return PILLS.find((p) => p.id === id)
}
