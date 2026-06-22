import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import TabBar from './components/TabBar'
import CabinetPage from './pages/cabinet/CabinetPage'
import HomePage from './pages/home/HomePage'
import MorePage from './pages/more/MorePage'
import ResultPage from './pages/result/ResultPage'
import ConversationPage from './pages/conversation/ConversationPage'
import ProfilePage from './pages/profile/ProfilePage'
import SymptomPage from './pages/symptom/SymptomPage'
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

/* 탭 화면(홈·내 기록·기타)에만 하단 탭바를 붙인다. */
function TabLayout() {
  return (
    <>
      <Outlet />
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
      onOpenSession={(sid) => navigate(`/conversation/${sid}`)}
    />
  )
}

function ConversationRoute() {
  const navigate = useNavigate()
  return <ConversationPage onBack={() => navigate(-1)} />
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
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route element={<TabLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cabinet" element={<CabinetRoute />} />
            <Route path="/more" element={<MoreRoute />} />
          </Route>
          <Route path="/pill/:id" element={<ResultRoute />} />
          <Route path="/conversation/:id" element={<ConversationRoute />} />
          <Route path="/symptom" element={<SymptomRoute />} />
          <Route path="/profile" element={<ProfileRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
