import { lazy, Suspense } from 'react'
import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigationType } from 'react-router'
import { trackPageview } from './lib/analytics.js'
import { ModeTransitionProvider } from './components/layout/ModeTransition.jsx'
import './styles/pages.css'
import Home from './pages/Home.jsx'
import Privacy from './pages/Privacy.jsx'
import Thanks from './pages/Thanks.jsx'
import NotFound from './pages/NotFound.jsx'
import { RoomLoadBoundary } from './components/layout/RoomLoadBoundary.jsx'
import { LoadingScreen } from './room/ui/LoadingScreen.jsx'

const Room = lazy(() => import('./pages/Room.jsx'))

function PageViews() {
  const { pathname } = useLocation()
  const { key, hash } = useLocation()
  const navType = useNavigationType()
  useEffect(() => trackPageview(pathname), [pathname])
  // New pages open at the top. Back/forward keep the browser's position and
  // hash links scroll to their own target.
  useEffect(() => {
    if (navType !== 'POP' && !hash) window.scrollTo(0, 0)
  }, [key, navType, hash])
  return null
}

export function App() {
  return (
    <ModeTransitionProvider>
      <PageViews />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/room"
          element={
            <RoomLoadBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Room />
              </Suspense>
            </RoomLoadBoundary>
          }
        />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ModeTransitionProvider>
  )
}
