import { useEffect, useRef, useState } from 'react'
import { profile } from '../../content/profile.js'
import { useCountUp } from '../../hooks/useCountUp.js'

function Stat({ value, label, start }) {
  const n = useCountUp(value, { start })
  return (
    <div className="stat">
      <strong>{String(n)}</strong>
      <span>{label}</span>
    </div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (typeof IntersectionObserver === 'undefined' || !el) {
      setStarted(true)
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="stats" ref={ref} aria-label="At a glance">
      {profile.stats.map((s) => (
        <Stat key={s.label} value={s.value} label={s.label} start={started} />
      ))}
    </section>
  )
}
