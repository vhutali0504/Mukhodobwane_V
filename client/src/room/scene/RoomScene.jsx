import { memo, useCallback, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { hitLine } from '../screens/drawMain.js'
import { isQuizOver } from '../terminal/quiz.js'
import { MENU } from '../terminal/constants.js'
import { LoadingScreen } from '../ui/LoadingScreen.jsx'
import { ACTIONABLE } from './layout.js'
import { CameraRig } from './CameraRig.jsx'
import { Desk } from './Desk.jsx'
import { Monitors } from './Monitors.jsx'
import { Props } from './Props.jsx'
import { Atmosphere } from './Atmosphere.jsx'
import { fontsPromise } from './useScreenTexture.js'

const BG = 0x020405
const DRAG_PX = 5
// "Sustained" low frame rate: below 20 fps in most samples of two windows in a
// row (about 5 s). A good window in between resets the count.
const SLOW_FPS = 20
const SLOW_STRIKES = 2

// Loading steps reported through three's DefaultLoadingManager, so drei's
// useProgress shows real progress: fonts ready, then the first rendered frame.
// end() is idempotent; cancel() settles whatever is still pending on unmount.
const manager = THREE.DefaultLoadingManager
function startLoadingSteps() {
  const pending = new Set(['fonts', 'first-frame'])
  const end = (k) => {
    if (pending.delete(k)) manager.itemEnd(`room:${k}`)
  }
  pending.forEach((k) => manager.itemStart(`room:${k}`))
  fontsPromise.then(() => end('fonts'))
  return { end, cancel: () => [...pending].forEach(end) }
}

function FirstFrame({ stepsRef, onFirstFrame }) {
  const seen = useRef(false)
  useFrame(() => {
    stepsRef.current?.end('first-frame')
    if (seen.current) return
    seen.current = true
    onFirstFrame?.()
  })
  return null
}

function SceneProgress() {
  const { progress, active, total, loaded } = useProgress()
  const finished = total > 0 && loaded >= total && !active
  if (finished) return null
  return <LoadingScreen progress={total ? progress : 0} />
}


// Which terminal row a click on the main screen means, or null for no action.
function mainScreenAction(t, uv, geom) {
  switch (t.mode) {
    case 'scan':
      return { type: 'pad' }
    case 'menu': {
      const i = hitLine(uv.y, geom, MENU.length)
      return i >= 0 ? { type: 'clickLine', index: i } : null
    }
    case 'quiz': {
      if (isQuizOver(t.quiz) || t.quiz.picked !== null) return { type: 'clickLine', index: 0 }
      const i = hitLine(uv.y, geom, 3)
      return i >= 0 ? { type: 'clickLine', index: i } : null
    }
    case 'game': {
      if (t.game.done) return { type: 'clickLine', index: 0 }
      if (uv.x > 0.57) return null
      const i = hitLine(uv.y, geom, t.game.words.length)
      return i >= 0 ? { type: 'clickLine', index: i } : null
    }
    case 'section':
    case 'msg':
      return { type: 'clickLine', index: 0 }
    default:
      return null
  }
}

function RoomScene({
  pose,
  onArrive,
  send,
  termRef,
  glitchRef,
  reducedMotion,
  monitorFps,
  onSlow,
  onContextLost,
  onFirstFrame,
  profile,
  facts,
}) {
  const geomRef = useRef({ menuY0: 0, lineH: 40, scrollMax: 0 })
  const poseRef = useRef(pose)
  const hovered = useRef(0)
  const dom = useRef(null)
  const strikes = useRef(0)
  const steps = useRef(null)
  useEffect(() => {
    steps.current = startLoadingSteps()
    return () => steps.current.cancel()
  }, [])

  const restCursor = () => {
    if (dom.current) dom.current.style.cursor = poseRef.current === 'moving' ? 'default' : 'grab'
  }
  useEffect(() => {
    poseRef.current = pose
    hovered.current = 0
    if (dom.current) dom.current.style.cursor = pose === 'moving' ? 'default' : 'grab'
  }, [pose])

  // bind(action, onPick?) returns R3F event handlers for a clickable object.
  // The pose decides which actions respond; drags never count as clicks.
  const bind = useCallback(
    (action, onPick) => {
      const can = () => ACTIONABLE[poseRef.current].includes(action)
      const handlers = {
        onClick(e) {
          e.stopPropagation()
          if (e.delta > DRAG_PX || !can()) return
          if (onPick) return onPick()
          const p = poseRef.current
          if (action === 'pad' || p === 'standing') {
            send({ type: action === 'pad' && p === 'seated' ? 'pad' : 'sit' })
            return
          }
          if (action === 'main' && e.uv) {
            const a = mainScreenAction(termRef.current, e.uv, geomRef.current)
            if (a) send(a)
          }
        },
        onPointerOver(e) {
          e.stopPropagation()
          if (!can() || !dom.current) return
          hovered.current += 1
          dom.current.style.cursor = 'pointer'
        },
        onPointerOut() {
          hovered.current = Math.max(0, hovered.current - 1)
          if (!hovered.current) restCursor()
        },
      }
      if (action === 'main') {
        handlers.onWheel = (e) => {
          if (poseRef.current !== 'seated') return
          const dy = e.nativeEvent?.deltaY ?? e.deltaY
          if (dy) send({ type: 'scroll', delta: Math.sign(dy) })
        }
      }
      return handlers
    },
    [send, termRef],
  )

  // A hidden tab gets no frames, so the first sample after it returns looks
  // slow. Samples near a visibility change do not count.
  const visibleSince = useRef(0)
  useEffect(() => {
    visibleSince.current = performance.now() // the grace period starts at mount
    const onVis = () => {
      visibleSince.current = performance.now()
      strikes.current = 0
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // A lost WebGL context (GPU reset, backgrounded tab under memory pressure) leaves a
  // dead canvas that three cannot fully rebuild, so hand over to the 2D terminal.
  const lostCleanup = useRef(null)
  const contextLost = useRef(onContextLost)
  useEffect(() => {
    contextLost.current = onContextLost
  }, [onContextLost])
  useEffect(() => () => lostCleanup.current?.(), [])

  const onDecline = useCallback(
    (api) => {
      if (api.fps >= SLOW_FPS || document.hidden) return
      if (performance.now() - visibleSince.current < 5000) return
      strikes.current += 1
      if (strikes.current >= SLOW_STRIKES) onSlow?.()
    },
    [onSlow],
  )
  const onIncline = useCallback(() => {
    strikes.current = 0
  }, [])

  return (
    <>
      <Canvas
        className="room-canvas"
        dpr={[1, 2]}
        shadows="percentage"
        camera={{ fov: 60, near: 0.05, far: 60, position: [0.9, 1.6, 0.2] }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none'
          gl.domElement.style.cursor = 'grab'
          dom.current = gl.domElement
          const lost = (e) => {
            e.preventDefault()
            contextLost.current?.()
          }
          gl.domElement.addEventListener('webglcontextlost', lost)
          lostCleanup.current = () => gl.domElement.removeEventListener('webglcontextlost', lost)
        }}
        onPointerDown={() => {
          // A click on the scene takes keyboard focus off any HUD button, so the
          // next Enter goes to the terminal instead of re-pressing that button.
          const el = document.activeElement
          if (el && el !== document.body && el.closest?.('.room-hud, .room-touch')) el.blur()
        }}
        aria-hidden="true"
      >
        <color attach="background" args={[BG]} />
        <fogExp2 attach="fog" args={[BG, 0.035]} />
        <FirstFrame stepsRef={steps} onFirstFrame={onFirstFrame} />
        {monitorFps && (
          <PerformanceMonitor bounds={() => [SLOW_FPS, SLOW_FPS + 1]} onDecline={onDecline} onIncline={onIncline} />
        )}
        <CameraRig pose={pose} onArrive={onArrive} reducedMotion={reducedMotion} />
        <Atmosphere reducedMotion={reducedMotion} />
        <Desk bind={bind} />
        <Monitors
          bind={bind}
          termRef={termRef}
          geomRef={geomRef}
          glitchRef={glitchRef}
          send={send}
          reducedMotion={reducedMotion}
          profile={profile}
        />
        <Props bind={bind} termRef={termRef} facts={facts} reducedMotion={reducedMotion} pose={pose} />
        <EffectComposer multisampling={4}>
          <Bloom intensity={1.1} radius={0.55} luminanceThreshold={0.55} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
      <SceneProgress />
    </>
  )
}

export default memo(RoomScene)
