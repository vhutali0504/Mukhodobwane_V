import { useEffect, useRef } from 'react'

// Keys whose browser default (page scroll, back navigation, quick find) would
// fight the terminal while seated.
const NAV_KEYS = new Set([
  'Enter', 'Backspace', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown',
])

const isTyping = (el) =>
  !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
const isControl = (el) => !!el && (el.tagName === 'BUTTON' || el.tagName === 'A')

// Standing: Enter asks to sit. Seated: every handled key goes to the engine as
// { type: 'key', key }. Browser shortcuts (Ctrl, Cmd, Alt) always pass through,
// and nothing happens while the camera is moving or in the 2D fallback.
export function useRoomKeyboard(dispatch, pose) {
  const latest = useRef({ dispatch, pose })
  useEffect(() => {
    latest.current = { dispatch, pose }
  })

  useEffect(() => {
    function onKeyDown(e) {
      const { dispatch: send, pose: p } = latest.current
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return
      if (isTyping(e.target)) return
      // Enter or Space on a focused button or link belongs to that control.
      if ((e.key === 'Enter' || e.key === ' ') && isControl(e.target)) return

      if (p === 'standing') {
        if (e.key === 'Enter') send({ type: 'sit' })
        return
      }
      if (p !== 'seated') return
      if (e.key.length !== 1 && !NAV_KEYS.has(e.key)) return
      e.preventDefault()
      send({ type: 'key', key: e.key })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
