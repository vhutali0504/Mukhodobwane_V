import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DX, DY, DZ } from './layout.js'
import { MAT } from './materials.js'
import { useScreenTexture } from './useScreenTexture.js'
import { G, DIM, mono } from '../screens/scanlines.js'

// Small seeded PRNG so the city skyline and rack pattern are the same every visit.
function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RW = 320
const RH = 220

function makeCity() {
  const rnd = seeded(7)
  const c = document.createElement('canvas')
  c.width = RW
  c.height = RH
  const x = c.getContext('2d')
  x.fillStyle = '#03070a'
  x.fillRect(0, 0, RW, RH)
  x.filter = 'blur(1px)'
  for (let i = 0; i < 26; i++) {
    const bw = 10 + rnd() * 30
    const bh = 40 + rnd() * 150
    const bx = rnd() * RW
    x.fillStyle = '#060c10'
    x.fillRect(bx, RH - bh, bw, bh)
    for (let j = 0; j < bh / 9; j++) {
      if (rnd() < 0.35) {
        x.fillStyle = rnd() < 0.6 ? 'rgba(255,179,71,0.55)' : 'rgba(120,220,210,0.45)'
        x.fillRect(bx + 2 + rnd() * (bw - 6), RH - bh + 4 + j * 9, 3, 3)
      }
    }
  }
  return c
}

// Window on the left wall: blurred city lights with rain running down the glass.
function RainWindow() {
  const city = useMemo(() => makeCity(), [])
  // Raindrop positions change every frame, so they live in a ref, not in render state.
  const drops = useRef(null)
  if (drops.current === null) {
    const rnd = seeded(11)
    drops.current = Array.from({ length: 110 }, () => ({
      x: rnd() * RW,
      y: rnd() * RH,
      v: 3 + rnd() * 4,
      l: 6 + rnd() * 10,
    }))
  }
  const map = useScreenTexture(
    RW,
    RH,
    (ctx) => {
      ctx.drawImage(city, 0, 0)
      ctx.strokeStyle = 'rgba(170,200,210,0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (const d of drops.current) {
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - 1, d.y + d.l)
        d.y += d.v
        if (d.y > RH) {
          d.y = -20
          d.x = Math.random() * RW
        }
      }
      ctx.stroke()
    },
    30,
  )
  const frame = [
    [0.05, 1.25, 0.05, -3.97, 1.75, -0.55],
    [0.05, 1.25, 0.05, -3.97, 1.75, 1.15],
    [0.05, 0.05, 1.75, -3.97, 2.35, 0.3],
    [0.05, 0.05, 1.75, -3.97, 1.15, 0.3],
    [0.05, 1.2, 0.03, -3.97, 1.75, 0.3],
    [0.16, 0.03, 1.85, -3.92, 1.12, 0.3],
  ]
  return (
    <group>
      <mesh position={[-3.99, 1.75, 0.3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.7, 1.15]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      {frame.map(([w, h, d, x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial {...MAT.dark} />
        </mesh>
      ))}
    </group>
  )
}

function Poster() {
  const map = useScreenTexture(
    256,
    360,
    (x) => {
      x.fillStyle = '#0b120d'
      x.fillRect(0, 0, 256, 360)
      x.strokeStyle = DIM
      x.lineWidth = 4
      x.strokeRect(10, 10, 236, 340)
      x.textBaseline = 'alphabetic'
      x.fillStyle = G
      x.font = mono(40, true)
      x.fillText('> root', 30, 80)
      x.font = mono(20)
      x.fillStyle = DIM
      ;['0xDEADBEEF', 'sudo make', '  me_a_sandwich', '', 'trust no', '  input.'].forEach((s, i) =>
        x.fillText(s, 30, 140 + i * 30),
      )
    },
    1,
  )
  return (
    <mesh position={[0.6, 1.85, -3.98]}>
      <planeGeometry args={[0.55, 0.78]} />
      <meshStandardMaterial map={map} roughness={0.9} emissive={0x0a2a14} emissiveIntensity={0.6} />
    </mesh>
  )
}

const ROWS = 14
const LEDS = 4
const OFF = new THREE.Color(0x03100a)

// Server rack in the corner with blinking status LEDs (one instanced mesh).
function Rack({ reducedMotion }) {
  const leds = useRef()
  const state = useMemo(() => {
    const rnd = seeded(3)
    return Array.from({ length: ROWS * LEDS }, () => ({
      on: true,
      color: new THREE.Color(rnd() < 0.75 ? 0x3cff8f : 0xffb347),
    }))
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    state.forEach((s, i) => {
      const r = Math.floor(i / LEDS)
      const k = i % LEDS
      m.makeTranslation(3.08 + k * 0.03, 0.29 + r * 0.115, -2.99)
      leds.current.setMatrixAt(i, m)
      leds.current.setColorAt(i, s.color)
    })
    leds.current.instanceMatrix.needsUpdate = true
    leds.current.instanceColor.needsUpdate = true
  }, [state])
  useFrame(() => {
    const p = reducedMotion ? 0.01 : 0.04
    let changed = false
    state.forEach((s, i) => {
      if (Math.random() < p) {
        s.on = !s.on
        leds.current.setColorAt(i, s.on ? s.color : OFF)
        changed = true
      }
    })
    if (changed) leds.current.instanceColor.needsUpdate = true
  })
  return (
    <group>
      <mesh position={[3.3, 0.95, -3.3]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 1.9, 0.6]} />
        <meshStandardMaterial color={0x0b0d0f} roughness={0.5} metalness={0.5} />
      </mesh>
      {Array.from({ length: ROWS }, (_, r) => (
        <mesh key={r} position={[3.3, 0.25 + r * 0.115, -2.995]}>
          <boxGeometry args={[0.56, 0.02, 0.01]} />
          <meshStandardMaterial color={0x15181a} roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      <instancedMesh ref={leds} args={[undefined, undefined, ROWS * LEDS]}>
        <boxGeometry args={[0.015, 0.015, 0.005]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <pointLight color={0x3cff8f} intensity={0.8} distance={2} decay={1.5} position={[3.1, 1, -2.6]} />
    </group>
  )
}

// Cables drooping from the desk to the rack.
function Cables() {
  const curves = useMemo(
    () =>
      Array.from(
        { length: 5 },
        (_, i) =>
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(DX - 0.5 + i * 0.2, DY, DZ - 0.35),
            new THREE.Vector3(DX - 0.4 + i * 0.25, 0.2, DZ - 0.3),
            new THREE.Vector3(DX + 0.5 + i * 0.4, 0.02, DZ - 0.1),
            new THREE.Vector3(3.0, 0.02, -3.0),
          ]),
      ),
    [],
  )
  return curves.map((c, i) => (
    <mesh key={i}>
      <tubeGeometry args={[c, 30, 0.008, 6]} />
      <meshStandardMaterial color={0x070808} roughness={0.6} metalness={0.1} />
    </mesh>
  ))
}

// Room shell, ambient lights and every background detail.
export function Atmosphere({ reducedMotion }) {
  return (
    <>
      <mesh position={[0, 1.6, 0]} receiveShadow>
        <boxGeometry args={[8, 3.2, 8]} />
        <meshStandardMaterial {...MAT.wall} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial {...MAT.floor} />
      </mesh>
      <mesh position={[-1.6, 0.006, -2.6]} receiveShadow>
        <boxGeometry args={[2.6, 0.01, 1.8]} />
        <meshStandardMaterial color={0x141010} roughness={1} metalness={0} />
      </mesh>
      <RainWindow />
      <Poster />
      <Rack reducedMotion={reducedMotion} />
      <Cables />
      <hemisphereLight args={[0x6a8a8a, 0x101010, 1.1]} />
      <directionalLight color={0x6f8fa0} intensity={0.8} position={[-5, 3, 1]} />
    </>
  )
}
