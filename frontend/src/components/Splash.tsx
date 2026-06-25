import { useEffect, useState } from 'react'
import styles from './Splash.module.css'

/* 랜딩 스플래시 = 로딩이 끝날 때까지 보여주는 진입 화면. 떨어져 있던 캡슐 두 반쪽이 모여 붙고 '약속'이 차오른다.
   2초 고정 노출 + reduced-motion 대응. (건너뛰기 없음 — 로딩 완료를 알리는 화면이므로) */
export default function Splash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0) // 0 등장(떨어짐) · 1 붙음 · 2 워드마크
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) {
      setPhase(2)
      const t = setTimeout(onDone, 2000)
      return () => clearTimeout(t)
    }
    const timers = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setLeaving(true), 1700),
      setTimeout(onDone, 2000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div
      className={`${styles.overlay}${leaving ? ` ${styles.leaving}` : ''}`}
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

      </div>
    </div>
  )
}
