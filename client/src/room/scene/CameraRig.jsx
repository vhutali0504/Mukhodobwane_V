import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DX, DZ } from './layout.js'
import { dragSeatedLook } from './seatedLook.js'

const STAND_POS = new THREE.Vector3(0.9, 1.6, 0.2)
const LOOK = new THREE.Vector3(DX, 1.05, DZ).sub(STAND_POS)
const YAW0 = Math.atan2(-LOOK.x, -LOOK.z)
const PITCH0 = Math.atan2(LOOK.y, Math.hypot(LOOK.x, LOOK.z))
const YAW_RANGE = 1.3
const PITCH_MIN = -0.7
const PITCH_MAX = 0.5
const DRAG_SPEED = 0.0035
const DUR = { seated: 1.9, standing: 1.5 }
const REDUCED_DUR = 0.4
const DIP = 0.12

const easeInOutCubic = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)

// `out` must be a camera: Object3D.lookAt points +Z at the target, cameras point -Z.
// Seated framing pulls back on narrow (portrait) screens so the main monitor fits.
function seatPose(aspect, out) {
  const back = Math.max(0, 1.7 - aspect) * 0.9
  out.position.set(DX, 1.32, -2.35 + back)
  out.lookAt(DX, 1.22, DZ - 0.1)
  return out
}

// Owns the camera. `pose` is 'standing' | 'moving' | 'seated'. When it becomes
// 'moving' the rig glides to the other pose and calls onArrive('seated'|'standing').
export function CameraRig({ pose, onArrive, reducedMotion = false }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const r = useRef(null)
  if (r.current === null) {
    r.current = {
      at: pose === 'seated' ? 'seated' : 'standing',
      yaw: YAW0,
      pitch: PITCH0,
      look: { yaw: 0, pitch: 0 },
      tween: null,
      drag: null,
      seat: new THREE.PerspectiveCamera(),
      euler: new THREE.Euler(0, 0, 0, 'YXZ'),
      par: new THREE.Vector2(),
    }
  }
  const onArriveRef = useRef(onArrive)
  useEffect(() => {
    onArriveRef.current = onArrive
  })

  // Initial placement.
  useEffect(() => {
    const s = r.current
    if (s.at === 'seated') {
      seatPose(size.width / size.height, s.seat)
      camera.position.copy(s.seat.position)
      camera.quaternion.copy(s.seat.quaternion)
    } else {
      camera.position.copy(STAND_POS)
      camera.quaternion.setFromEuler(s.euler.set(s.pitch, s.yaw, 0))
    }
    // Only on mount: later poses are animated by the frame loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start a move whenever the shell asks for one.
  useEffect(() => {
    const s = r.current
    if (pose !== 'moving' || s.tween) return
    const to = s.at === 'seated' ? 'standing' : 'seated'
    const target = new THREE.PerspectiveCamera()
    if (to === 'seated') {
      seatPose(size.width / size.height, target)
      s.look = { yaw: 0, pitch: 0 }
    } else {
      target.position.copy(STAND_POS)
      target.quaternion.setFromEuler(s.euler.set(s.pitch, s.yaw, 0))
    }
    s.tween = {
      to,
      fp: camera.position.clone(),
      fq: camera.quaternion.clone(),
      p: target.position.clone(),
      q: target.quaternion.clone(),
      start: performance.now(),
      dur: (reducedMotion ? REDUCED_DUR : DUR[to]) * 1000,
      dip: reducedMotion ? 0 : DIP,
    }
  }, [pose, camera, size, reducedMotion])

  // Drag to look around, standing or seated (seated turns are limited so the
  // desk stays in view). Pointer capture keeps the drag alive when the pointer
  // leaves the canvas.
  useEffect(() => {
    const el = gl.domElement
    const s = r.current
    const down = (e) => {
      s.drag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, id: e.pointerId }
    }
    const move = (e) => {
      const d = s.drag
      if (!d || d.id !== e.pointerId) return
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) {
        d.moved = true
        el.setPointerCapture?.(e.pointerId)
      }
      if (d.moved && s.at === 'standing' && !s.tween) {
        s.yaw = THREE.MathUtils.clamp(s.yaw - (e.clientX - d.lx) * DRAG_SPEED, YAW0 - YAW_RANGE, YAW0 + YAW_RANGE)
        s.pitch = THREE.MathUtils.clamp(s.pitch - (e.clientY - d.ly) * DRAG_SPEED, PITCH_MIN, PITCH_MAX)
      }
      if (d.moved && s.at === 'seated' && !s.tween) {
        s.look = dragSeatedLook(s.look, e.clientX - d.lx, e.clientY - d.ly)
      }
      d.lx = e.clientX
      d.ly = e.clientY
    }
    const up = (e) => {
      if (s.drag?.id === e.pointerId) s.drag = null
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useFrame((state, dt) => {
    const s = r.current
    const cam = state.camera
    const tw = s.tween
    if (tw) {
      const k = Math.min(1, (performance.now() - tw.start) / tw.dur)
      const e = easeInOutCubic(k)
      cam.position.lerpVectors(tw.fp, tw.p, e)
      cam.position.y -= Math.sin(k * Math.PI) * tw.dip
      cam.quaternion.slerpQuaternions(tw.fq, tw.q, e)
      if (k >= 1) {
        s.tween = null
        s.at = tw.to
        onArriveRef.current?.(tw.to)
      }
      return
    }
    const t = state.clock.elapsedTime
    if (s.at === 'standing') {
      const swayP = reducedMotion ? 0 : Math.sin(t * 0.5) * 0.004
      const swayY = reducedMotion ? 0 : Math.sin(t * 0.3) * 0.006
      cam.position.copy(STAND_POS)
      cam.quaternion.setFromEuler(s.euler.set(s.pitch + swayP, s.yaw + swayY, 0))
    } else {
      // Seated: the dragged head turn plus a small parallax that follows the pointer.
      seatPose(state.size.width / state.size.height, s.seat)
      s.par.x = THREE.MathUtils.damp(s.par.x, state.pointer.x, 6, dt)
      s.par.y = THREE.MathUtils.damp(s.par.y, state.pointer.y, 6, dt)
      // Build the angle from absolute yaw and pitch (no roll), so looking up and
      // to the side at once never tilts the horizon.
      s.euler.setFromQuaternion(s.seat.quaternion, 'YXZ')
      const pitch = s.euler.x + s.look.pitch + s.par.y * 0.06
      const yaw = s.euler.y + s.look.yaw - s.par.x * 0.09
      cam.position.copy(s.seat.position)
      cam.quaternion.setFromEuler(s.euler.set(pitch, yaw, 0, 'YXZ'))
    }
  })

  return null
}
