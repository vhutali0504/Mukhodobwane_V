import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import './styles/pages.css'
import Home from './pages/Home.jsx'
import Privacy from './pages/Privacy.jsx'
import Thanks from './pages/Thanks.jsx'
import NotFound from './pages/NotFound.jsx'
import { LoadingScreen } from './room/ui/LoadingScreen.jsx'

const Room = lazy(() => import('./pages/Room.jsx'))

export function App() {
  return (
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
  )
}
