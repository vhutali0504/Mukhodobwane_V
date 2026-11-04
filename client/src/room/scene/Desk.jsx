import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { DX, DY, DZ } from './layout.js'
import { MAT } from './materials.js'

const ROWS = 4
const COLS = 14

// 56 keycaps as one instanced mesh: one draw call instead of 56.
function Keycaps() {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let i = 0
    for (let r = 0; r < ROWS; r++) {
      for (let k = 0; k < COLS; k++) {
        m.makeTranslation(DX - 0.208 + k * 0.032, DY + 0.05, DZ + 0.202 + r * 0.032)
        ref.current.setMatrixAt(i++, m)
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, ROWS * COLS]} castShadow>
      <boxGeometry args={[0.026, 0.009, 0.026]} />
      <meshStandardMaterial color={0x1c2124} roughness={0.5} metalness={0.2} />
    </instancedMesh>
  )
}

const LEGS = [
  [-1.55, -0.35],
  [1.55, -0.35],
  [-1.55, 0.35],
  [1.55, 0.35],
]

// Desk, keyboard, mouse and the red under-desk strip. Clicking any of it sits down.
export function Desk({ bind }) {
  return (
    <group {...bind('desk')}>
      <RoundedBox args={[3.2, 0.05, 0.8]} radius={0.012} smoothness={2} position={[DX, DY, DZ]} castShadow receiveShadow>
        <meshStandardMaterial {...MAT.desk} />
      </RoundedBox>
      {/* modesty panel and cable tray behind the monitors */}
      <mesh position={[DX, DY - 0.25, DZ - 0.38]} receiveShadow>
        <boxGeometry args={[3.0, 0.42, 0.02]} />
        <meshStandardMaterial {...MAT.dark} />
      </mesh>
      {LEGS.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[DX + x, DY / 2, DZ + z]} castShadow>
          <boxGeometry args={[0.05, DY, 0.05]} />
          <meshStandardMaterial {...MAT.metal} />
        </mesh>
      ))}
      {/* red light strip under the front edge */}
      <mesh position={[DX, DY - 0.03, DZ + 0.4]}>
        <boxGeometry args={[3.2, 0.012, 0.012]} />
        <meshBasicMaterial color={0xff2a2a} toneMapped={false} />
      </mesh>
      <pointLight color={0xff2a2a} intensity={2.5} distance={2.6} decay={1.4} position={[DX, 0.45, DZ + 0.45]} />

      {/* desk mat */}
      <mesh position={[DX + 0.12, DY + 0.0265, DZ + 0.24]} receiveShadow>
        <boxGeometry args={[1.0, 0.003, 0.3]} />
        <meshStandardMaterial color={0x0d1012} roughness={0.95} />
      </mesh>
      {/* keyboard: case, red underglow, keys */}
      <RoundedBox args={[0.48, 0.02, 0.15]} radius={0.006} smoothness={2} position={[DX, DY + 0.037, DZ + 0.25]} castShadow>
        <meshStandardMaterial {...MAT.dark} />
      </RoundedBox>
      <mesh position={[DX, DY + 0.029, DZ + 0.25]}>
        <boxGeometry args={[0.5, 0.004, 0.17]} />
        <meshBasicMaterial color={0x5a0d0d} toneMapped={false} />
      </mesh>
      <Keycaps />
      {/* mouse */}
      <mesh position={[DX + 0.36, DY + 0.04, DZ + 0.26]} scale={[0.032, 0.016, 0.05]} castShadow>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial {...MAT.dark} />
      </mesh>
    </group>
  )
}
