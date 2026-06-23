/* 카메라 모드 = 카메라 뷰파인더가 주인공 (촬영→인식).
   실제 getUserMedia 없이 내부 상태로 대기/인식중/권한거부 데모. props 없음. */
import { useState } from 'react'
import PillImage from '../../components/PillImage'
import { ScanIcon } from '../../components/icons'
import styles from './CameraPage.module.css'

type CamState = 'idle' | 'scanning' | 'denied'

const DEMO: { key: CamState; label: string }[] = [
  { key: 'idle', label: '대기' },
  { key: 'scanning', label: '인식 중' },
  { key: 'denied', label: '권한 거부' },
]

function LockIcon({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M12 15v2" />
    </svg>
  )
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

const TIPS = [
  '밝은 곳에서 알약 한 알을 평평하게 놓아 주세요.',
  '글자나 분할선이 보이면 더 정확하게 알려드려요.',
  '사진은 인식에만 쓰고 따로 저장하지 않아요.',
]

export default function CameraPage() {
  const [cam, setCam] = useState<CamState>('idle')

  return (
    <div className={styles.home}>
      <header className={styles.greeting}>
        <h1 className={styles.greetingTitle}>어떤 약인지 함께 살펴볼까요?</h1>
        <p className={styles.greetingSub}>알약을 비추면 이름과 복약 안내를 찾아드려요.</p>
      </header>

      <div className={styles.stage}>
        <div
          className={styles.viewfinder}
          role="img"
          aria-label={
            cam === 'denied'
              ? '카메라 권한이 꺼져 있어요'
              : cam === 'scanning'
                ? '알약을 인식하는 중'
                : '카메라 뷰파인더, 가운데에 알약을 맞춰 주세요'
          }
        >
          <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

          {cam === 'denied' ? (
            <div className={styles.denied}>
              <span className={styles.deniedIcon}>
                <LockIcon />
              </span>
              <span className={styles.deniedTitle}>카메라 권한이 필요해요</span>
              <span className={styles.deniedDesc}>
                알약을 비추려면 카메라 사용을 허용해 주세요. 사진은 인식에만 쓰여요.
              </span>
            </div>
          ) : cam === 'scanning' ? (
            <>
              <div className={styles.spinner} aria-hidden="true" />
              <span className={styles.scanline} aria-hidden="true" />
            </>
          ) : (
            <div className={styles.silhouette} aria-hidden="true">
              <PillImage look={{ kind: 'caplet', color: 'var(--accent-line)' }} size={132} />
            </div>
          )}
        </div>

        {cam !== 'denied' && (
          <div className={styles.caption}>
            <span className={styles.captionMain}>
              {cam === 'scanning' ? '알약을 살펴보는 중이에요' : '가운데 칸에 알약을 맞춰 주세요'}
            </span>
            <span className={styles.captionSub}>
              {cam === 'scanning'
                ? '잠시만 기다려 주세요. 곧 알려드릴게요.'
                : '한 알만 평평하게 놓으면 자동으로 인식돼요.'}
            </span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {cam === 'denied' ? (
          <button type="button" className="btn-primary" onClick={() => setCam('idle')}>
            카메라 권한 다시 시도
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={cam === 'scanning'}
            onClick={() => setCam('scanning')}
          >
            <span className={styles.shutter}>
              <ScanIcon size={20} />
              {cam === 'scanning' ? '인식하는 중…' : '알약 촬영하기'}
            </span>
          </button>
        )}
      </div>

      <section className={`card ${styles.tips}`} aria-labelledby="camera-tips">
        <div className={styles.tipsHead}>
          <span className="badge">촬영 팁</span>
          <span id="camera-tips" className={styles.tipsTitle}>더 정확하게 인식하려면</span>
        </div>
        <ul className={styles.tipList}>
          {TIPS.map((tip) => (
            <li key={tip} className={styles.tipItem}>
              <span className={styles.tipMark} aria-hidden="true">
                <CheckIcon />
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.demoBar}>
        <span className={styles.demoLabel}>데모 상태</span>
        <div className={styles.demoToggle} role="group" aria-label="데모 상태 전환">
          {DEMO.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`${styles.demoBtn} ${cam === key ? styles.demoBtnOn : ''}`}
              aria-pressed={cam === key}
              onClick={() => setCam(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
