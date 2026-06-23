import { useEffect, useState } from 'react'
import styles from './Splash.module.css'

/* 랜딩 스플래시 = 앱 진입 모션. 캡슐이 열리며 그 사이로 '약속'이 차오르는 모프.
   자동 사라짐 + 탭하면 건너뛰기 + reduced-motion 대응. */
export default function Splash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0) // 0 등장 · 1 열림 · 2 워드마크
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) {
      setPhase(2)
      const t = setTimeout(onDone, 900)
      return () => clearTimeout(t)
    }
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 950),
      setTimeout(() => setLeaving(true), 2000),
      setTimeout(onDone, 2350),
    ]
    return () => timers.forEach(clearTimeout)
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
        <span className={styles.glow} aria-hidden="true" />

        <div className={styles.capsule} aria-hidden="true">
          <span className={`${styles.half} ${phase >= 1 ? styles.splitL : ''}`}>
            <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
              <path d="M64 0 H26 A26 26 0 0 0 26 52 H64 Z" fill="var(--accent)" />
              <path d="M64 0 H26 A26 26 0 0 0 26 52 H64 Z" fill="url(#splashGlossL)" />
              <defs>
                <radialGradient id="splashGlossL" cx="35%" cy="22%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.40" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </span>
          <span className={`${styles.half} ${styles.halfR} ${phase >= 1 ? styles.splitR : ''}`}>
            <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
              <path d="M0 0 H38 A26 26 0 0 1 38 52 H0 Z" fill="var(--bg-elev)" />
              <path
                d="M0.5 0.5 H38 A25.5 25.5 0 0 1 38 51.5 H0.5 Z"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
              <path d="M0 0 H38 A26 26 0 0 1 38 52 H0 Z" fill="url(#splashGlossR)" />
              <defs>
                <radialGradient id="splashGlossR" cx="60%" cy="22%" r="55%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.70" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </span>
        </div>

        <div className={`${styles.brand} ${phase >= 2 ? styles.brandOn : ''}`}>
          <span className={styles.name}>약속</span>
          <span className={styles.tagline}>잊지 않게, 안심하게</span>
        </div>

        <span className={styles.skip}>탭하여 건너뛰기</span>
      </div>
    </div>
  )
}
