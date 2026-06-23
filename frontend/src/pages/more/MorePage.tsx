import { PersonIcon, MedKitIcon, BookIcon, ChevronRight } from '../../components/icons'
import styles from './MorePage.module.css'

/* 기타 = 메뉴 (내 정보 입력 / 증상별 약 추천 / 전체 알약 사전) */
export default function MorePage({
  onProfile,
  onSymptom,
  onAllPills,
}: {
  onProfile: () => void
  onSymptom: () => void
  onAllPills: () => void
}) {
  return (
    <div className="screen screen--scroll">
      <h1 className="page-title">기타</h1>
      <p className={`page-sub ${styles.intro}`}>필요한 걸 골라보세요.</p>

      <div className="more-list">
        <button className={`more-item ${styles.item}`} onClick={onProfile}>
          <span className={`more-icon ${styles.icon}`}><PersonIcon size={24} /></span>
          <span className={styles.body}>
            <span className={`more-title ${styles.title}`}>내 정보 입력</span>
            <span className={`more-desc ${styles.desc}`}>나이·성별·복용약·알레르기 수정</span>
          </span>
          <span className={`more-chev ${styles.chev}`}><ChevronRight /></span>
        </button>

        <button className={`more-item ${styles.item}`} onClick={onSymptom}>
          <span className={`more-icon ${styles.icon}`}><MedKitIcon size={24} /></span>
          <span className={styles.body}>
            <span className={`more-title ${styles.title}`}>증상별 약 추천</span>
            <span className={`more-desc ${styles.desc}`}>증상을 입력하면 일반의약품을 추천</span>
          </span>
          <span className={`more-chev ${styles.chev}`}><ChevronRight /></span>
        </button>

        <button className={`more-item ${styles.item}`} onClick={onAllPills}>
          <span className={`more-icon ${styles.icon}`}><BookIcon size={24} /></span>
          <span className={styles.body}>
            <span className={`more-title ${styles.title}`}>전체 알약 사전</span>
            <span className={`more-desc ${styles.desc}`}>데이터셋에 등록된 모든 약을 검색·열람</span>
          </span>
          <span className={`more-chev ${styles.chev}`}><ChevronRight /></span>
        </button>
      </div>

      <p className={styles.disclaimer}>
        약속은 의료 전문가의 진단을 대신할 수 없어요. 중요한 복약 결정은 반드시 의사 또는 약사와 상담하세요.
      </p>
    </div>
  )
}
