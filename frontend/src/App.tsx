import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Splash from './components/Splash'
import TabBar from './components/TabBar'
import styles from './App.module.css'

/* 탭 순서(좌→우) — 슬라이드 방향 판단용. 알약사전·카메라·홈·대화·기타, 홈이 가운데. */
const TAB_ORDER = ['/cabinet', '/camera', '/', '/chat', '/more']
import CabinetPage from './pages/cabinet/CabinetPage'
import CameraPage from './pages/camera/CameraPage'
import HomePage from './pages/home/HomePage'
import ChatPage from './pages/chat/ChatPage'
import MorePage from './pages/more/MorePage'
import ResultPage from './pages/result/ResultPage'
import ConversationPage from './pages/conversation/ConversationPage'
import ProfilePage from './pages/profile/ProfilePage'
import SymptomPage from './pages/symptom/SymptomPage'
import AllPillsPage from './pages/allpills/AllPillsPage'
import IdentifyResultPage from './pages/identify/IdentifyResultPage'
import { hasHealth } from './lib/storage'

/* 앱 셸 + 온보딩 가드: 건강정보가 없으면 내 정보 입력(/profile)으로 보낸다. */
function RootLayout() {
  const { pathname } = useLocation()
  if (!hasHealth() && pathname !== '/profile') return <Navigate to="/profile" replace />
  return (
    <div className="app">
      <Outlet />
    </div>
  )
}

/* 탭 화면(알약사전·카메라·홈·대화·기타)에만 하단 탭바를 붙이고, 탭 전환 시 좌우 슬라이드. */
function TabLayout() {
  const location = useLocation()
  const idx = TAB_ORDER.indexOf(location.pathname)
  const prev = useRef(idx)
  const dir = idx > prev.current ? styles.fromRight : idx < prev.current ? styles.fromLeft : ''
  useEffect(() => {
    prev.current = idx
  })
  return (
    <>
      <div className={`${styles.slide} ${dir}`} key={location.pathname}>
        <Outlet />
      </div>
      <TabBar />
    </>
  )
}

function CabinetRoute() {
  const navigate = useNavigate()
  return <CabinetPage onOpen={(id) => navigate(`/pill/${id}`)} />
}

function MoreRoute() {
  const navigate = useNavigate()
  return (
    <MorePage
      onProfile={() => navigate('/profile', { state: { from: 'more' } })}
      onSymptom={() => navigate('/symptom')}
      onAllPills={() => navigate('/all-pills')}
    />
  )
}

function AllPillsRoute() {
  const navigate = useNavigate()
  return <AllPillsPage onBack={() => navigate(-1)} onSelect={(id) => navigate(`/pill/${id}`)} />
}

function ResultRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  return (
    <ResultPage
      onBack={() => navigate(-1)}
      onNewSession={() => navigate(`/conversation/new?pill=${id ?? ''}`)}
    />
  )
}

function ConversationRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  if (!id) return <Navigate to="/chat" replace />
  return <ConversationPage conversationId={id} onBack={() => navigate(-1)} />
}

function SymptomRoute() {
  const navigate = useNavigate()
  return <SymptomPage onBack={() => navigate(-1)} />
}

function ProfileRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromMore = (location.state as { from?: string } | null)?.from === 'more'
  return (
    <ProfilePage
      onDone={() => navigate(fromMore ? '/more' : '/', { replace: !fromMore })}
      onBack={fromMore ? () => navigate(-1) : undefined}
    />
  )
}

export default function App() {
  const [splashing, setSplashing] = useState(true)
  return (
    <BrowserRouter>
      {splashing && <Splash onDone={() => setSplashing(false)} />}
      <Routes>
        <Route element={<RootLayout />}>
          <Route element={<TabLayout />}>
            <Route path="/cabinet" element={<CabinetRoute />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/more" element={<MoreRoute />} />
          </Route>
          <Route path="/pill/:id" element={<ResultRoute />} />
          <Route path="/identify" element={<IdentifyResultPage />} />
          <Route path="/conversation/:id" element={<ConversationRoute />} />
          <Route path="/symptom" element={<SymptomRoute />} />
          <Route path="/all-pills" element={<AllPillsRoute />} />
          <Route path="/profile" element={<ProfileRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
