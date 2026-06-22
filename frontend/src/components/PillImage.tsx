/* 알약 이미지 — 실제 사진 대신 모양·색으로 SVG 생성 (프로토타입 더미)
   무드: 다정한 / 부드러운 / 안심되는. 색(color/color2)은 데이터값이라 prop 그대로 사용.
   그림자·하이라이트·엣지 등 보조 묘사색은 rgba 상수(SVG 내부 묘사색). */
export type PillKind = 'capsule' | 'oval' | 'round' | 'caplet'
export type PillLook = {
  kind: PillKind
  color: string
  color2?: string
  /** 선택: 알약 위에 작게 새기는 각인 텍스트 (있을 때만 렌더) */
  imprint?: string
  /** 선택: 분할선 강제 (round/caplet에서 기본 분할선과 별개로 항상 표시) */
  scored?: boolean
}

/* 보조 묘사색 (토큰 강제 대상 아님 — SVG 내부 명암) */
const HL = 'rgba(255,255,255,0.50)' // 하이라이트(반짝임)
const HL_SOFT = 'rgba(255,255,255,0.22)' // 넓고 은은한 광택
const EDGE = 'rgba(0,0,0,0.16)' // 외곽 엣지
const SCORE = 'rgba(0,0,0,0.22)' // 분할선
const SHADOW = 'rgba(15,30,30,0.16)' // 바닥 그림자
const IMPRINT = 'rgba(0,0,0,0.34)' // 각인 텍스트

/* 인스턴스마다 gradient/filter id 충돌 방지용 안정적 접미사 */
let seq = 0

export default function PillImage({ look, size = 56 }: { look: PillLook; size?: number }) {
  const { kind, color, color2, imprint, scored } = look
  const uid = `pi${(seq = (seq + 1) % 1e6)}`
  const shadeId = `${uid}-shade`
  const glossId = `${uid}-gloss`
  const softId = `${uid}-soft`

  // 각인: 한두 글자만 또렷하게 (장식이라 잘릴 만큼 길면 잘라 표시)
  const stamp = imprint ? imprint.trim().slice(0, 4) : ''

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        {/* 알약 몸체: 위는 밝게, 아래는 살짝 가라앉는 부드러운 음영 */}
        <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.30" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.14" />
        </linearGradient>
        {/* 가장자리만 살짝 어둡게 모아주는 광택 */}
        <radialGradient id={glossId} cx="0.36" cy="0.30" r="0.85">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* 둥근 알약 전체에 은은히 깔리는 부드러운 톤 */}
        <linearGradient id={softId} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {kind === 'oval' && (
        <g transform="rotate(-18 32 32)">
          <ellipse cx="32" cy="44" rx="22" ry="5.5" fill={SHADOW} />
          <ellipse cx="32" cy="31" rx="24" ry="14.5" fill={color} />
          <ellipse cx="32" cy="31" rx="24" ry="14.5" fill={`url(#${shadeId})`} />
          <ellipse cx="32" cy="31" rx="24" ry="14.5" fill="none" stroke={EDGE} strokeWidth="1" />
          {scored && <line x1="32" y1="20" x2="32" y2="42" stroke={SCORE} strokeWidth="1.2" />}
          <ellipse cx="24" cy="25" rx="9" ry="3" fill={HL} />
          {stamp && (
            <text x="32" y="34.5" fontSize="9" fontWeight="700" textAnchor="middle" fill={IMPRINT} fontFamily="var(--font-sans)">
              {stamp}
            </text>
          )}
        </g>
      )}

      {kind === 'caplet' && (
        <g transform="rotate(-18 32 32)">
          <rect x="11" y="39" width="42" height="5" rx="2.5" fill={SHADOW} />
          <rect x="9" y="25" width="46" height="14" rx="7" fill={color} />
          <rect x="9" y="25" width="46" height="14" rx="7" fill={`url(#${shadeId})`} />
          <rect x="9" y="25" width="46" height="14" rx="7" fill="none" stroke={EDGE} strokeWidth="1" />
          <line x1="32" y1="26.5" x2="32" y2="37.5" stroke={SCORE} strokeWidth="1.2" />
          {stamp ? (
            <>
              <text x="20.5" y="35" fontSize="8" fontWeight="700" textAnchor="middle" fill={IMPRINT} fontFamily="var(--font-sans)">
                {stamp.slice(0, 2)}
              </text>
              {stamp.length > 2 && (
                <text x="43.5" y="35" fontSize="8" fontWeight="700" textAnchor="middle" fill={IMPRINT} fontFamily="var(--font-sans)">
                  {stamp.slice(2, 4)}
                </text>
              )}
            </>
          ) : (
            <rect x="14" y="28.5" width="10" height="2.6" rx="1.3" fill={HL} />
          )}
        </g>
      )}

      {kind === 'round' && (
        <g>
          <ellipse cx="32" cy="48" rx="15" ry="4" fill={SHADOW} />
          <circle cx="32" cy="32" r="16" fill={color} />
          <circle cx="32" cy="32" r="16" fill={`url(#${softId})`} />
          <circle cx="32" cy="32" r="16" fill={`url(#${glossId})`} />
          <circle cx="32" cy="32" r="16" fill="none" stroke={EDGE} strokeWidth="1" />
          {(scored ?? true) && <line x1="17.5" y1="32" x2="46.5" y2="32" stroke={SCORE} strokeWidth="1.2" />}
          {stamp ? (
            <text x="32" y={scored === false ? 36 : 28} fontSize="9" fontWeight="700" textAnchor="middle" fill={IMPRINT} fontFamily="var(--font-sans)">
              {stamp}
            </text>
          ) : (
            <ellipse cx="26" cy="25" rx="6" ry="2.6" fill={HL} transform="rotate(-22 26 25)" />
          )}
        </g>
      )}

      {kind === 'capsule' && (
        <g transform="rotate(-18 32 32)">
          <rect x="11" y="39" width="42" height="5" rx="2.5" fill={SHADOW} />
          {/* 오른쪽 몸통(보통 투명/연한 쪽 = color2) */}
          <path d="M32 25h15a7 7 0 0 1 0 14H32z" fill={color2 ?? '#e9ecf0'} />
          {/* 왼쪽 몸통(color) */}
          <path d="M17 25h15v14H17a7 7 0 0 1 0-14z" fill={color} />
          {/* 이음새: 좌측 캡이 우측을 살짝 덮는 결합부 */}
          <path d="M30 25h2v14h-2z" fill={color} />
          <line x1="32" y1="25.4" x2="32" y2="38.6" stroke={EDGE} strokeWidth="1" />
          {/* 전체 음영 + 외곽선 */}
          <rect x="10" y="25" width="44" height="14" rx="7" fill={`url(#${shadeId})`} />
          <rect x="10" y="25" width="44" height="14" rx="7" fill="none" stroke={EDGE} strokeWidth="1" />
          {stamp ? (
            <text x="21" y="35" fontSize="8" fontWeight="700" textAnchor="middle" fill={IMPRINT} fontFamily="var(--font-sans)">
              {stamp.slice(0, 2)}
            </text>
          ) : (
            <rect x="15" y="28.5" width="9" height="2.6" rx="1.3" fill={HL_SOFT} />
          )}
        </g>
      )}
    </svg>
  )
}
