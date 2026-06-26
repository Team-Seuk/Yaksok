import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Splash from './components/Splash'
import TabBar from './components/TabBar'
import { SplashReadyContext } from './lib/splash'
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
import PillDetailPage from './pages/dictionary/PillDetailPage'
import IdentifyResultPage from './pages/identify/IdentifyResultPage'
import TodayEditPage from './pages/today/TodayEditPage'
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
  // 탭↔탭만 좌우 슬라이드. 탭 밖(/today 등)을 드나들 땐 슬라이드 없이 View Transition에 맡긴다.
  const dir =
    idx === -1 || prev.current === -1
      ? ''
      : idx > prev.current
        ? styles.fromRight
        : idx < prev.current
          ? styles.fromLeft
          : ''
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
  return (
    <AllPillsPage
      onBack={() => navigate(-1)}
      onSelect={(itemSeq) => navigate(`/dictionary/${itemSeq}`)}
    />
  )
}

function PillDetailRoute() {
  const navigate = useNavigate()
  const { itemSeq } = useParams()
  return (
    <PillDetailPage
      itemSeq={itemSeq ?? ''}
      onBack={() => navigate(-1)}
      onAsk={() => navigate(`/conversation/new?pill=${itemSeq ?? ''}`)}
    />
  )
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

function TodayRoute() {
  const navigate = useNavigate()
  // 홈으로 morph 전환(replace로 history 중복 방지). 기기 뒤로가기(pop)도 홈으로 돌아간다.
  return <TodayEditPage onBack={() => navigate('/', { viewTransition: true, replace: true })} />
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
      <SplashReadyContext.Provider value={!splashing}>
        {splashing && <Splash onDone={() => setSplashing(false)} />}
        <Routes>
        <Route element={<RootLayout />}>
          <Route element={<TabLayout />}>
            <Route path="/cabinet" element={<CabinetRoute />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/more" element={<MoreRoute />} />
            <Route path="/today" element={<TodayRoute />} />
          </Route>
          <Route path="/pill/:id" element={<ResultRoute />} />
          <Route path="/dictionary/:itemSeq" element={<PillDetailRoute />} />
          <Route path="/identify" element={<IdentifyResultPage />} />
          <Route path="/conversation/:id" element={<ConversationRoute />} />
          <Route path="/symptom" element={<SymptomRoute />} />
          <Route path="/all-pills" element={<AllPillsRoute />} />
          <Route path="/profile" element={<ProfileRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        </Routes>
      </SplashReadyContext.Provider>
    </BrowserRouter>
  )
}
