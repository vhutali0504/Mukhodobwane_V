import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { DX, DY, DZ } from './layout.js'
import { MAT } from './materials.js'
import { useScreenTexture } from './useScreenTexture.js'
import { drawNote } from '../screens/drawNote.js'

const damp = THREE.MathUtils.damp
// The prototype had the cans at x -1.25, where the chair hides them when
// standing and the seated camera cannot see them. Moved inside the seated view.
const CANS = [
  { x: -0.72, z: 0.2, body: 0x2a2a2a, band: 0x3cff8f, dir: -1 },
  { x: -0.6, z: 0.28, body: 0x1d3a24, band: 0xffb347, dir: 1 },
  { x: -0.67, z: 0.08, body: 0x2a2a2a, band: 0x3cff8f, dir: -1 },
]

// Energy-drink can: knocks over to its side on click, stands back up on the next.
function Can({ x, z, body, band, dir, bind }) {
  const ref = useRef()
  const [down, setDown] = useState(false)
  const k = useRef(0)
  useFrame((_, dt) => {
    k.current = damp(k.current, down ? 1 : 0, 9, dt)
    ref.current.rotation.z = dir * k.current * (Math.PI / 2)
    ref.current.position.y = DY + 0.025 + k.current * 0.03
  })
  return (
    <group ref={ref} position={[DX + x, DY + 0.025, DZ + z]} {...bind('can', () => setDown((d) => !d))}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.12, 24]} />
        <meshStandardMaterial color={body} roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.121, 0]}>
        <cylinderGeometry args={[0.026, 0.032, 0.006, 24]} />
        <meshStandardMaterial color={0x8a9096} roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.0325, 0.0325, 0.02, 24]} />
        <meshBasicMaterial color={band} toneMapped={false} />
      </mesh>
    </group>
  )
}

// Desk lamp with a warm spot light; click toggles it.
function Lamp({ bind }) {
  const [on, setOn] = useState(true)
  const light = useRef()
  useEffect(() => {
    light.current.target.position.set(DX + 0.9, DY, DZ + 0.1)
    light.current.target.updateMatrixWorld()
  }, [])
  return (
    <>
      <group position={[DX + 1.35, DY + 0.025, DZ - 0.1]} {...bind('lamp', () => setOn((v) => !v))}>
        <mesh position={[0, 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.075, 0.02, 24]} />
          <meshStandardMaterial {...MAT.dark} />
        </mesh>
        <mesh position={[-0.03, 0.24, 0]} rotation={[0, 0, 0.25]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.45, 10]} />
          <meshStandardMaterial {...MAT.metal} />
        </mesh>
        <mesh position={[-0.07, 0.46, 0.02]} rotation={[0, 0, -0.9]} castShadow>
          <coneGeometry args={[0.07, 0.1, 24, 1, true]} />
          <meshStandardMaterial color={0x222222} roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.1, 0.43, 0.02]}>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color={on ? 0xffc070 : 0x221a10} toneMapped={false} />
        </mesh>
      </group>
      <spotLight
        ref={light}
        visible={on}
        color={0xffb347}
        intensity={5}
        distance={3}
        angle={0.7}
        penumbra={0.6}
        decay={1.5}
        position={[DX + 1.25, DY + 0.45, DZ - 0.08]}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0005}
      />
    </>
  )
}

// Gaming chair; each click adds a full turn. Hidden once seated: the camera is
// in it, and on portrait screens its back would cover the desk.
function Chair({ bind, visible }) {
  const ref = useRef()
  const [turns, setTurns] = useState(0)
  useFrame((_, dt) => {
    ref.current.rotation.y = damp(ref.current.rotation.y, turns * Math.PI * 2, 3, dt)
  })
  return (
    <group ref={ref} visible={visible} position={[DX, 0, -2.55]} {...bind('chair', () => setTurns((n) => n + 1))}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 12]} />
        <meshStandardMaterial {...MAT.metal} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i * Math.PI * 2) / 5
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.15, 0.05, 0]} castShadow>
              <boxGeometry args={[0.3, 0.03, 0.04]} />
              <meshStandardMaterial {...MAT.dark} />
            </mesh>
            <mesh position={[0.29, 0.025, 0]}>
              <sphereGeometry args={[0.025, 10, 8]} />
              <meshStandardMaterial {...MAT.dark} />
            </mesh>
          </group>
        )
      })}
      <RoundedBox args={[0.52, 0.08, 0.5]} radius={0.03} smoothness={3} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...MAT.fabric} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.62, 0.07]} radius={0.03} smoothness={3} position={[0, 0.88, 0.24]} castShadow>
        <meshStandardMaterial {...MAT.fabric} />
      </RoundedBox>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 0.88, 0.24]} castShadow>
          <boxGeometry args={[0.06, 0.6, 0.075]} />
          <meshStandardMaterial {...MAT.accent} />
        </mesh>
      ))}
      <RoundedBox args={[0.3, 0.1, 0.06]} radius={0.025} smoothness={3} position={[0, 1.16, 0.25]} castShadow>
        <meshStandardMaterial {...MAT.fabric} />
      </RoundedBox>
      {[-0.27, 0.27].map((x) => (
        <mesh key={x} position={[x, 0.66, 0.02]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.32]} />
          <meshStandardMaterial {...MAT.dark} />
        </mesh>
      ))}
    </group>
  )
}

// Sticky note on the right monitor: each click flips to the next fact.
function Note({ bind, facts, reducedMotion }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * facts.length))
  const flip = useRef(0)
  const shown = useRef(idx)
  const mesh = useRef()
  const text = facts[idx % facts.length]
  const map = useScreenTexture(256, 256, (ctx) => drawNote(ctx, text), 2)
  useFrame((_, dt) => {
    // A new fact starts the flip; reduced motion just swaps the text.
    if (shown.current !== idx) {
      shown.current = idx
      if (!reducedMotion) flip.current = 1
    }
    flip.current = damp(flip.current, 0, 7, dt)
    mesh.current.rotation.x = -flip.current * 1.2
  })
  const next = () => setIdx((i) => i + 1)
  return (
    <group position={[DX + 0.88, 1.13, DZ - 0.02]} rotation={[0, -0.5, 0]}>
      <mesh ref={mesh} position={[0.29, 0.2, 0.004]} rotation={[0, 0, -0.12]} {...bind('note', next)}>
        <planeGeometry args={[0.13, 0.13]} />
        <meshStandardMaterial map={map} roughness={0.9} emissive={0x2a2408} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// Fingerprint pad: pulses while waiting for a scan, bright while scanning.
function Pad({ bind, termRef, reducedMotion }) {
  const glow = useRef()
  const color = useRef(new THREE.Color())
  useFrame(({ clock }) => {
    const t = termRef.current
    const waiting = t.mode === 'scan' && t.scanAt < 0
    const scanning = t.mode === 'scan' && t.scanAt >= 0
    const c = color.current
    if (scanning || t.mode === 'granted') {
      const s = reducedMotion ? 1 : 0.75 + 0.25 * Math.sin(clock.elapsedTime * 18)
      c.setRGB(0.235 * s, 1 * s, 0.56 * s)
    } else if (waiting) {
      const s = reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(clock.elapsedTime * 5)
      c.setRGB(0.12, 0.4 + 0.5 * s, 0.25)
    } else c.set(0x1f8f50)
    glow.current.color.copy(c)
  })
  return (
    <group {...bind('pad')}>
      <RoundedBox args={[0.1, 0.018, 0.12]} radius={0.005} smoothness={2} position={[DX + 0.55, DY + 0.035, DZ + 0.25]} castShadow>
        <meshStandardMaterial {...MAT.dark} />
      </RoundedBox>
      <mesh position={[DX + 0.55, DY + 0.0445, DZ + 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.035, 32]} />
        <meshBasicMaterial ref={glow} color={0x1f8f50} toneMapped={false} />
      </mesh>
      <mesh position={[DX + 0.55, DY + 0.0448, DZ + 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.043, 32]} />
        <meshBasicMaterial color={0x0c2a18} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Props({ bind, termRef, facts, reducedMotion, pose }) {
  return (
    <>
      {CANS.map((c, i) => (
        <Can key={i} {...c} bind={bind} />
      ))}
      <Lamp bind={bind} />
      <Chair bind={bind} visible={pose !== 'seated'} />
      <Note bind={bind} facts={facts} reducedMotion={reducedMotion} />
      <Pad bind={bind} termRef={termRef} reducedMotion={reducedMotion} />
    </>
  )
}
