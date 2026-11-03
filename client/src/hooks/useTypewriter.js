import { useEffect, useState } from 'react'

// Types each phrase, holds it, deletes it, then moves to the next.
// When disabled it returns the first phrase and schedules nothing.
export function useTypewriter(
  phrases,
  { typeMs = 70, deleteMs = 35, holdMs = 1500, enabled = true } = {},
) {
  const [state, setState] = useState({ index: 0, length: 0, deleting: false })

  useEffect(() => {
    if (!enabled) return undefined
    const full = phrases[state.index].length
    let delay
    let next
    if (!state.deleting && state.length < full) {
      delay = typeMs
      next = { ...state, length: state.length + 1 }
    } else if (!state.deleting) {
      delay = holdMs
      next = { ...state, deleting: true }
    } else if (state.length > 0) {
      delay = deleteMs
      next = { ...state, length: state.length - 1 }
    } else {
      delay = deleteMs
      next = { index: (state.index + 1) % phrases.length, length: 0, deleting: false }
    }
    const id = setTimeout(() => setState(next), delay)
    return () => clearTimeout(id)
  }, [state, phrases, enabled, typeMs, deleteMs, holdMs])

  if (!enabled) return phrases[0]
  return phrases[state.index].slice(0, state.length)
}
