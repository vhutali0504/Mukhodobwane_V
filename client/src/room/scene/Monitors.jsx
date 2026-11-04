import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { DX, DY, DZ } from './layout.js'
import { MAT } from './materials.js'
import { useScreenTexture } from './useScreenTexture.js'
import { drawMain } from '../screens/drawMain.js'
import { drawSideLeft, drawSideRight, drawTopLeft, drawTopRight } from '../screens/drawSide.js'

// One monitor: bezel, glowing canvas screen and (when it floats above the desk) a stand.
function Screen({ size: [w, h], canvas: [cw, ch], position, rotation = [0, 0], draw, fps, handlers }) {
  const map = useScreenTexture(cw, ch, draw, fps)
  const standH = position[1] - h / 2 - DY
  return (
    <group position={position} rotation={[rotation[0], rotation[1], 0, 'YXZ']}>
      <RoundedBox args={[w + 0.045, h + 0.045, 0.035]} radius={0.008} smoothness={2} position={[0, 0, -0.02]} castShadow {...handlers.bezel}>
        <meshStandardMaterial {...MAT.dark} />
      </RoundedBox>
      <mesh {...handlers.screen}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
      {standH > 0.05 && (
        <group position={[0, -h / 2 - standH / 2, -0.05]}>
          <mesh castShadow>
            <boxGeometry args={[0.04, standH, 0.04]} />
            <meshStandardMaterial {...MAT.metal} />
          </mesh>
          <mesh position={[0, -standH / 2 + 0.006, 0.02]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 0.012, 0.14]} />
            <meshStandardMaterial {...MAT.metal} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// Green spill from the screens. Flickers slightly, and jumps during a glitch.
function ScreenLight({ glitchRef, reducedMotion }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const now = performance.now()
    const flicker = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 13) * 0.08
    const burst = !reducedMotion && now < glitchRef.current ? Math.random() * 1.5 : 0
    ref.current.intensity = 3.5 + flicker + burst
  })
  return <pointLight ref={ref} color={0x3cff8f} intensity={3.5} distance={5} decay={1.2} position={[DX, 1.25, DZ + 0.5]} />
}

// The five-monitor rig. The main screen draws the terminal; the others react to it.
export function Monitors({ bind, termRef, geomRef, glitchRef, send, reducedMotion, profile }) {
  const desk = bind('desk')
  const deskHandlers = { bezel: desk, screen: desk }
  const opts = { reducedMotion, profile }

  function drawMainScreen(ctx, now) {
    const t = termRef.current
    const geom = drawMain(ctx, t, now, { ...opts, glitchUntil: glitchRef.current })
    geomRef.current = geom
    if (geom.scrollMax !== t.scrollMax) send({ type: 'setScrollMax', max: geom.scrollMax })
  }

  return (
    <group>
      <Screen
        size={[0.92, 0.55]}
        canvas={[1024, 612]}
        position={[DX, 1.2, DZ - 0.12]}
        draw={drawMainScreen}
        fps={30}
        handlers={{ bezel: desk, screen: bind('main') }}
      />
      <Screen
        size={[0.64, 0.4]}
        canvas={[512, 320]}
        position={[DX - 0.88, 1.13, DZ - 0.02]}
        rotation={[0, 0.5]}
        draw={drawSideLeft}
        fps={20}
        handlers={deskHandlers}
      />
      <Screen
        size={[0.64, 0.4]}
        canvas={[512, 320]}
        position={[DX + 0.88, 1.13, DZ - 0.02]}
        rotation={[0, -0.5]}
        draw={(ctx, now) => drawSideRight(ctx, termRef.current, now, opts)}
        fps={20}
        handlers={deskHandlers}
      />
      <Screen
        size={[0.58, 0.33]}
        canvas={[512, 292]}
        position={[DX - 0.33, 1.68, DZ - 0.17]}
        rotation={[0.12, 0.06]}
        draw={drawTopLeft}
        fps={15}
        handlers={deskHandlers}
      />
      <Screen
        size={[0.58, 0.33]}
        canvas={[512, 292]}
        position={[DX + 0.33, 1.68, DZ - 0.17]}
        rotation={[0.12, -0.06]}
        draw={(ctx, now) => drawTopRight(ctx, now, new Date())}
        fps={10}
        handlers={deskHandlers}
      />
      <ScreenLight glitchRef={glitchRef} reducedMotion={reducedMotion} />
    </group>
  )
}
