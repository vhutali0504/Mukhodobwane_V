import '@fontsource/ibm-plex-mono/700.css'
import '../../styles/room.css'
import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { GLITCH_MS } from '../terminal/constants.js'
import { profile } from '../../content/profile.js'
import { FACTS } from '../../content/facts.js'
import { hasWebGL } from '../../lib/webgl.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import { RoomHud } from '../ui/RoomHud.jsx'
import { TouchControls, useCoarsePointer } from '../ui/TouchControls.jsx'
import { TerminalFallback } from '../ui/TerminalFallback.jsx'
import { LoadingScreen } from '../ui/LoadingScreen.jsx'
import { useRoomKeyboard } from '../ui/useRoomKeyboard.js'
import { initRoom, roomReducer } from './roomReducer.js'

// three.js and the scene load in their own chunk, so the 2D fallback never downloads them.
const RoomScene = lazy(() => import('./RoomScene.jsx'))

const TIMED_MODES = ['boot', 'scan', 'granted']
// No rendered frame this long after the 3D view mounts (slow network, chunk or
// shader compile) counts as a slow device: switch to the 2D terminal.
export const FIRST_FRAME_TIMEOUT_MS = 10000
const now = () => performance.now()

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.error('3D room failed, switching to the 2D terminal', error)
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// Owns the terminal state (useReducer around the engine's step) and the camera
// pose, and renders the 3D room or the 2D TerminalFallback.
export function RoomShell() {
  const reducedMotion = useReducedMotion()
  const coarse = useCoarsePointer()
  const [fallback, setFallback] = useState(() => (hasWebGL() ? null : 'nowebgl'))
  const [monitorFps, setMonitorFps] = useState(true)
  const [state, dispatch] = useReducer(roomReducer, fallback, (fb) => initRoom({ now: now(), twoD: !!fb }))
  const { t, pose, movingTo } = state

  const termRef = useRef(t)
  const glitchRef = useRef(0)
  useLayoutEffect(() => {
    termRef.current = t
  }, [t])

  // Every UI action goes through here, stamped with the engine's clock.
  const send = useCallback((a) => dispatch({ now: now(), ...a }), [])
  const onArrive = useCallback((at) => dispatch({ type: 'arrive', at, now: now() }), [])

  // The canvas screens read the glitch deadline; the CSS flicker is keyed below.
  useEffect(() => {
    if (state.glitchSeq) glitchRef.current = now() + GLITCH_MS
  }, [state.glitchSeq])

  // Boot, scan and grant advance on time.
  const timed = TIMED_MODES.includes(t.mode)
  useEffect(() => {
    if (!timed) return
    const id = setInterval(() => dispatch({ type: 'tick', now: now() }), 50)
    return () => clearInterval(id)
  }, [timed])

  useRoomKeyboard(send, fallback ? null : pose)

  // e2e hook (R3): only in test-mode builds.
  useEffect(() => {
    if (import.meta.env.MODE !== 'test') return
    window.__roomDebug = () => ({ mode: termRef.current.mode, sec: termRef.current.sec })
    return () => {
      delete window.__roomDebug
    }
  }, [])

  const goTo2d = useCallback((reason) => {
    setFallback(reason)
    dispatch({ type: 'enter2d', now: now() })
  }, [])
  const onSlow = useCallback(() => goTo2d('slow'), [goTo2d])
  const onSceneError = useCallback(() => goTo2d('error'), [goTo2d])
  const onTextOnly = useCallback(() => goTo2d('chosen'), [goTo2d])

  // Loading escape hatch. A hidden tab gets no frames, so the clock restarts
  // instead of firing while the visitor is away.
  const firstFrameSeen = useRef(false)
  const onFirstFrame = useCallback(() => {
    firstFrameSeen.current = true
  }, [])
  useEffect(() => {
    if (fallback) return
    firstFrameSeen.current = false
    let id
    const arm = () => {
      id = setTimeout(() => {
        if (firstFrameSeen.current) return
        if (document.hidden) arm()
        else onSlow()
      }, FIRST_FRAME_TIMEOUT_MS)
    }
    arm()
    return () => clearTimeout(id)
  }, [fallback, onSlow])

  const glitch = state.glitchSeq > 0 && !reducedMotion && (
    <div key={state.glitchSeq} className="room-glitch" aria-hidden="true" />
  )

  if (fallback) {
    const canRetry = fallback === 'slow' || fallback === 'chosen'
    const try3d = () => {
      if (fallback === 'slow') setMonitorFps(false)
      setFallback(null)
    }
    return (
      <div className="room room-2d">
        <TerminalFallback
          t={t}
          dispatch={send}
          profile={profile}
          reason={fallback}
          onTry3D={canRetry ? try3d : undefined}
        />
        {glitch}
      </div>
    )
  }

  return (
    <div className={coarse ? 'room room-coarse' : 'room'}>
      <div className="room-stage">
        <SceneBoundary onError={onSceneError}>
          <Suspense fallback={<LoadingScreen progress={0} />}>
            <RoomScene
              pose={pose}
              onArrive={onArrive}
              send={send}
              termRef={termRef}
              glitchRef={glitchRef}
              reducedMotion={reducedMotion}
              monitorFps={monitorFps}
              onSlow={onSlow}
              onFirstFrame={onFirstFrame}
              profile={profile}
              facts={FACTS}
            />
          </Suspense>
        </SceneBoundary>
        <RoomHud
          pose={pose}
          movingTo={movingTo}
          onStand={() => send({ type: 'stand' })}
          onSit={() => send({ type: 'sit' })}
          onTextOnly={onTextOnly}
          controls={!coarse}
        />
        {glitch}
      </div>
      <TouchControls t={t} dispatch={send} pose={pose} onTextOnly={onTextOnly} />
    </div>
  )
}
