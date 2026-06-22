import { useEffect, useState } from 'react'
import Pill3D from './Pill3D'
import styles from './Splash.module.css'

/* 랜딩 스플래시 = 앱 진입 모션그래픽. '약속' + 실제 3D 알약(Three.js).
   자동 사라짐 + 탭하면 건너뛰기 + reduced-motion 대응. */
export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const hold = reduce ? 900 : 3000
    const t1 = setTimeout(() => setLeaving(true), hold)
    const t2 = setTimeout(onDone, hold + 360)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  function skip() {
    setLeaving(true)
    setTimeout(onDone, 320)
  }

  return (
    <div
      className={`${styles.overlay}${leaving ? ` ${styles.leaving}` : ''}`}
      onClick={skip}
      aria-label="약속 시작 화면"
    >
      <div className={styles.panel}>
        <div className={styles.stage}>
          <Pill3D size={208} />
        </div>
        <div className={styles.brand}>
          <span className={styles.name}>약속</span>
          <span className={styles.tagline}>잊지 않게, 안심하게</span>
        </div>
      </div>
    </div>
  )
}
