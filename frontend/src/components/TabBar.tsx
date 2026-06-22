import { useLocation, useNavigate } from 'react-router-dom'
import { BookIcon, ScanIcon, GridIcon } from './icons'

/* 하단 탭바 — 라우터 기반. 경로로 활성 탭을 판단한다. */
const TABS = [
  { path: '/cabinet', label: '내 기록', Icon: BookIcon },
  { path: '/', label: '홈', Icon: ScanIcon },
  { path: '/more', label: '기타', Icon: GridIcon },
] as const

export default function TabBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <nav className="tabbar">
      {TABS.map(({ path, label, Icon }) => {
        const on = pathname === path
        return (
          <button
            key={path}
            className={`tab${on ? ' tab--on' : ''}`}
            onClick={() => navigate(path)}
            aria-current={on ? 'page' : undefined}
          >
            <Icon />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
