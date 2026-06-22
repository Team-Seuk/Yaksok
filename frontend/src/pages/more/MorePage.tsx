import { PersonIcon, MedKitIcon, ChevronRight } from '../../components/icons'
import styles from './MorePage.module.css'

/* 기타 = 메뉴 (내 정보 입력 / 증상별 약 추천) */
export default function MorePage({ onProfile, onSymptom }: { onProfile: () => void; onSymptom: () => void }) {
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
      </div>
    </div>
  )
}
