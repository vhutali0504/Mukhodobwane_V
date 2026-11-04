import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Resolves once IBM Plex Mono (both weights the screens use) is ready, so the
// first texture draw never falls back to a system font.
let fontsReady = false
export const fontsPromise =
  typeof document !== 'undefined' && document.fonts
    ? Promise.all([
        document.fonts.load('25px "IBM Plex Mono"'),
        document.fonts.load('bold 25px "IBM Plex Mono"'),
      ])
        .catch(() => {})
        .then(() => document.fonts.ready)
        .catch(() => {})
        .then(() => {
          fontsReady = true
        })
    : Promise.resolve().then(() => {
        fontsReady = true
      })

// A canvas-backed texture redrawn by `draw(ctx, now)` at most `fps` times a
// second. Drawing pauses while the tab is hidden and until fonts are ready.
// `now` is performance.now(), the same clock the terminal engine uses.
export function useScreenTexture(width, height, draw, fps = 30) {
  const gl = useThree((s) => s.gl)
  const drawRef = useRef(draw)
  const last = useRef(-Infinity)
  const live = useRef(null)

  useEffect(() => {
    drawRef.current = draw
  })

  const screen = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const c = canvas.getContext('2d')
    c.fillStyle = '#010402'
    c.fillRect(0, 0, width, height)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    return { ctx: c, texture: tex }
  }, [width, height, gl])

  useEffect(() => {
    live.current = screen
    return () => screen.texture.dispose()
  }, [screen])

  useFrame(() => {
    const s = live.current
    if (!s || !fontsReady || document.hidden) return
    const now = performance.now()
    if (now - last.current < 1000 / fps) return
    last.current = now
    drawRef.current(s.ctx, now)
    s.texture.needsUpdate = true
  })

  return screen.texture
}
