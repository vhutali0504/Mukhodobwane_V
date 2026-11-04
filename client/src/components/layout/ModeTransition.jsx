import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import GlitchOverlay from './GlitchOverlay.jsx'

export const SLICE_MS = 450
const COVER_MS = 220
const UNCOVER_MS = 320

const Ctx = createContext(null)

// Owns the overlay. `go(to)` plays the glitch then navigates; arriving at or
// leaving /room by any route fades back in. Reduced motion navigates at once.
export function ModeTransitionProvider({ children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(null)
  const timer = useRef(0)
  const prev = useRef(pathname)

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    const was = prev.current
    prev.current = pathname
    if (was === pathname || reduced) return
    if (was === '/room' || pathname === '/room') {
      setPhase('in')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setPhase(null), UNCOVER_MS)
    }
  }, [pathname, reduced])

  const go = useCallback(
    (to) => {
      if (to === pathname) return
      if (reduced) {
        navigate(to)
        return
      }
      clearTimeout(timer.current)
      setPhase('out')
      timer.current = setTimeout(() => navigate(to), SLICE_MS + COVER_MS)
    },
    [navigate, reduced, pathname],
  )

  const value = useMemo(() => ({ go }), [go])
  return (
    <Ctx.Provider value={value}>
      {children}
      <GlitchOverlay phase={phase} />
    </Ctx.Provider>
  )
}

// Without a provider (isolated tests) the switch just navigates.
export function useModeTransition() {
  const ctx = useContext(Ctx)
  const navigate = useNavigate()
  return ctx ?? { go: (to) => navigate(to) }
}

// onClick for a link that should play the transition. Modified clicks fall through.
export function useSwitchClick(to) {
  const { go } = useModeTransition()
  return (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    go(to)
  }
}
