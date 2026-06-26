/* 카메라 모드 = 실제 기기 카메라(getUserMedia)를 뷰파인더로 라이브 표시.
   화면에 들어오면(=탭 진입) 바로 카메라를 요청한다. 최초 1회 권한 허용 후엔 즉시 켜진다.
   인식은 셔터 버튼을 눌렀을 때 그 순간의 프레임 1장을 캡처해 진행한다(자동 스캔 아님).
   ※ getUserMedia는 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작.

   연출(서류 캡처용): /camera?stage=shot — 실제 카메라 대신 데모 알약 사진을 띄워 "촬영·인식 중" 모습을 보여준다. */
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './CameraPage.module.css'

type CamState = 'loading' | 'live' | 'denied'
type FocusCaps = MediaTrackCapabilities & { focusMode?: string[] }

const DEMO_PHOTO = '/demo/pill.jpg'

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

/* 중앙 조준선 — 사각 코너 브래킷 + 십자. */
function Reticle() {
  return (
    <svg
      className={styles.reticle}
      viewBox="0 0 192 192"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 29V23Q19 19 23 19H29" />
      <path d="M173 29V23Q173 19 169 19H163" />
      <path d="M19 163V169Q19 173 23 173H29" />
      <path d="M173 163V169Q173 173 169 173H163" />
      <path d="M92 96H100M96 92V100" />
    </svg>
  )
}

export default function CameraPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const stageShot = new URLSearchParams(location.search).get('stage') === 'shot'
  const [cam, setCam] = useState<CamState>('loading')
  const [attempt, setAttempt] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  /* 탭에 들어오면 카메라 시작, 떠나면(언마운트) 트랙을 멈춰 카메라를 끈다. attempt를 올리면 재시도.
     연출 모드(stageShot)에선 실제 카메라를 켜지 않는다. */
  useEffect(() => {
    if (stageShot) return
    let cancelled = false

    async function start() {
      setCam('loading')
      if (!navigator.mediaDevices?.getUserMedia) {
        setCam('denied')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream

        const track = stream.getVideoTracks()[0]
        if (track) {
          try {
            const caps = track.getCapabilities?.() as FocusCaps | undefined
            if (caps?.focusMode?.includes('continuous')) {
              await track.applyConstraints({
                advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
              })
            }
          } catch {
            /* 미지원 — 기기 기본 자동초점에 맡긴다 */
          }
        }

        if (!cancelled) setCam('live')
      } catch {
        if (!cancelled) setCam('denied')
      }
    }

    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [attempt, stageShot])

  /* 셔터 — 버튼을 누른 순간의 프레임 1장을 찍어 바로 대화창으로 넘긴다.
     비전 인식은 대화창에서 처리하므로 여기선 카메라가 멈추거나 기다리지 않는다. */
  function handleShutter() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    // 뷰파인더(정사각 center-crop)와 동일하게 중앙 정사각으로 잘라 저장한다.
    const side = Math.min(video.videoWidth, video.videoHeight)
    const sx = (video.videoWidth - side) / 2
    const sy = (video.videoHeight - side) / 2
    const canvas = document.createElement('canvas')
    canvas.width = side
    canvas.height = side
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, sx, sy, side, side, 0, 0, side, side)
    const image = canvas.toDataURL('image/jpeg', 0.9)
    navigate('/chat', { state: { scan: { image } } })
  }

  return (
    <div className={styles.home}>
      <header className={styles.greeting}>
        <h1 className={styles.greetingTitle}>카메라</h1>
        <p className={styles.greetingSub}>사진으로 알아보기</p>
      </header>

      <div className={styles.stage}>
        <div
          className={styles.viewfinder}
          role="img"
          aria-label={
            stageShot
              ? '알약을 촬영해 인식하는 중'
              : cam === 'denied'
                ? '카메라 권한이 꺼져 있어요'
                : cam === 'loading'
                  ? '카메라를 준비하는 중'
                  : '카메라 미리보기, 가운데에 알약을 맞춰 주세요'
          }
        >
          <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

          {stageShot ? (
            <img src={DEMO_PHOTO} className={styles.video} alt="" />
          ) : cam === 'denied' ? (
            <div className={styles.denied}>
              <span className={styles.deniedIcon}>
                <LockIcon />
              </span>
              <span className={styles.deniedTitle}>카메라를 켤 수 없어요</span>
              <span className={styles.deniedDesc}>
                카메라 사용을 허용해 주세요. 사진은 인식에만 쓰여요.
              </span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className={styles.video}
                autoPlay
                playsInline
                muted
                aria-hidden={cam !== 'live'}
              />
              {cam === 'loading' && <div className={styles.spinner} aria-hidden="true" />}
            </>
          )}

          {(stageShot || cam === 'live') && <Reticle />}
        </div>

        {cam !== 'denied' && (
          <p className={styles.caption}>
            {stageShot
              ? '알약을 인식하고 있어요'
              : cam === 'live'
                ? '가운데에 알약을 맞춰 주세요'
                : '카메라를 준비하고 있어요'}
          </p>
        )}
      </div>

      {!stageShot && (
        <div className={styles.controlBar}>
          {cam === 'denied' ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setAttempt((a) => a + 1)}
            >
              카메라 다시 시도
            </button>
          ) : (
            <button
              type="button"
              className={styles.shutterBtn}
              onClick={handleShutter}
              disabled={cam !== 'live'}
              aria-label="사진 촬영"
            >
              <span className={styles.shutterCore} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
