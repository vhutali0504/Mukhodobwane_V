import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion.js'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

export function useCountUp(target, { durationMs = 1200, start = false } = {}) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (reduced || !start) return undefined
    const t0 = performance.now()
    let id
    const frame = () => {
      const k = Math.min(1, (performance.now() - t0) / durationMs)
      setValue(k >= 1 ? target : Math.round(target * easeOutCubic(k)))
      if (k < 1) id = requestAnimationFrame(frame)
    }
    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [reduced, start, target, durationMs])

  return reduced ? target : value
}
