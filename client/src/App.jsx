import { lazy, Suspense } from 'react'
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { trackPageview } from './lib/analytics.js'
import { ModeTransitionProvider } from './components/layout/ModeTransition.jsx'
import './styles/pages.css'
import Home from './pages/Home.jsx'
import Privacy from './pages/Privacy.jsx'
import Thanks from './pages/Thanks.jsx'
import NotFound from './pages/NotFound.jsx'
import { LoadingScreen } from './room/ui/LoadingScreen.jsx'

const Room = lazy(() => import('./pages/Room.jsx'))

function PageViews() {
  const { pathname } = useLocation()
  useEffect(() => trackPageview(pathname), [pathname])
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
            <Suspense fallback={<LoadingScreen />}>
              <Room />
            </Suspense>
          }
        />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ModeTransitionProvider>
  )
}
