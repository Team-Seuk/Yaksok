import { useLocation, useNavigate } from 'react-router-dom'
import { PillIcon, ScanIcon, HomeIcon, ChatIcon, MenuIcon } from './icons'

/* 하단 탭바 — 라우터 기반. 경로로 활성 탭을 판단한다. 좌→우 5탭, 홈이 가운데. */
const TABS = [
  { path: '/cabinet', label: '알약사전', Icon: PillIcon },
  { path: '/camera', label: '카메라', Icon: ScanIcon },
  { path: '/', label: '홈', Icon: HomeIcon },
  { path: '/chat', label: '대화', Icon: ChatIcon },
  { path: '/more', label: '기타', Icon: MenuIcon },
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
