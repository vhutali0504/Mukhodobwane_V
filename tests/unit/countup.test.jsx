import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, renderHook, act } from '@testing-library/react'
import { useCountUp } from '../../client/src/hooks/useCountUp.js'
import Stats from '../../client/src/components/formal/Stats.jsx'
import { profile } from '../../client/src/content/profile.js'

let now = 0
let callbacks = []

function stubMotion(reduced) {
  vi.stubGlobal('matchMedia', () => ({
    matches: reduced,
    addEventListener() {},
    removeEventListener() {},
  }))
}

function advanceTo(ms) {
  now = ms
  const cbs = callbacks
  callbacks = []
  act(() => cbs.forEach((cb) => cb(ms)))
}

beforeEach(() => {
  now = 0
  callbacks = []
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    callbacks.push(cb)
    return callbacks.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
  stubMotion(false)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useCountUp', () => {
  it('goes from 0 to the target, monotonically, over the duration', () => {
    const { result } = renderHook(() => useCountUp(2024, { start: true }))
    expect(result.current).toBe(0)
    let prev = 0
    for (const t of [200, 400, 600, 800, 1000]) {
      advanceTo(t)
      expect(result.current).toBeGreaterThanOrEqual(prev)
      expect(result.current).toBeLessThan(2024)
      prev = result.current
    }
    advanceTo(1200)
    expect(result.current).toBe(2024)
  })

  it('stays at 0 when start is false', () => {
    const { result } = renderHook(() => useCountUp(2024, { start: false }))
    advanceTo(600)
    advanceTo(1200)
    expect(result.current).toBe(0)
  })

  it('returns the target at once under reduced motion', () => {
    stubMotion(true)
    const { result } = renderHook(() => useCountUp(2024, { start: false }))
    expect(result.current).toBe(2024)
  })
})

describe('Stats', () => {
  it('renders every label and never hides or fades the strip', () => {
    stubMotion(true)
    render(<Stats />)
    for (const s of profile.stats) expect(screen.getByText(s.label)).toBeInTheDocument()
    const strip = document.querySelector('.stats')
    expect(strip).not.toBeNull()
    expect(strip.hidden).toBe(false)
    expect(strip.getAttribute('style') || '').not.toMatch(/opacity|visibility|display/)
    expect(strip.className).not.toMatch(/fade|reveal|hidden/)
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('counts up once when first intersecting, then never restarts', () => {
    let trigger
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb, opts) {
          trigger = cb
          this.opts = opts
          expect(opts.threshold).toBe(0.4)
        }
        observe() {}
        disconnect() {
          disconnect()
        }
      },
    )
    render(<Stats />)
    expect(document.querySelectorAll('.stat strong')[3]).toHaveTextContent('0')
    act(() => trigger([{ isIntersecting: true }]))
    advanceTo(1200)
    const nums = [...document.querySelectorAll('.stat strong')].map((n) => n.textContent)
    expect(nums).toEqual(['5', '5', '2', '2024'])
    expect(disconnect).toHaveBeenCalled()
  })

  it('starts counting immediately when IntersectionObserver is missing', () => {
    render(<Stats />)
    advanceTo(1200)
    expect(document.querySelectorAll('.stat strong')[3]).toHaveTextContent('2024')
  })
})
