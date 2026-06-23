/* 인라인 SVG 아이콘 — 외부 아이콘 라이브러리 없이 사용. stroke 기반, currentColor. */

type IconProps = { size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function BookIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15.5H5.5A1.5 1.5 0 0 1 4 18z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15.5h5.5A1.5 1.5 0 0 0 20 18z" />
    </svg>
  )
}

export function ScanIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
      <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
      <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
    </svg>
  )
}

export function GridIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  )
}

export function PillIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3.5" y="8" width="17" height="8" rx="4" transform="rotate(45 12 12)" />
      <path d="M9.2 14.8 14.8 9.2" />
    </svg>
  )
}

export function HomeIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function ChatIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M20 4H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h3v3l4-3h9a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
    </svg>
  )
}

export function MenuIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function PersonIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="9" r="3" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  )
}

export function MedKitIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M12 11v5M9.5 13.5h5" />
    </svg>
  )
}

export function ChevronRight({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}><path d="M9 6l6 6-6 6" /></svg>
  )
}

export function ChevronLeft({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}><path d="M15 6l-6 6 6 6" /></svg>
  )
}

export function ArrowUp({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} stroke="#06201c" strokeWidth={2.2}><path d="M12 19V6M6 12l6-6 6 6" /></svg>
  )
}

export function DocIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
    </svg>
  )
}

export function PlusIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}><path d="M12 5v14M5 12h14" /></svg>
  )
}
