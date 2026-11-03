import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useTypewriter } from '../../client/src/hooks/useTypewriter.js'

const phrases = ['Full-stack developer', 'Second phrase']

// Each timer is scheduled by an effect after a re-render, so advance in small
// steps and let React flush between them (the same as real elapsed time).
const elapse = (ms) => {
  for (let t = 0; t < ms; t += 5) act(() => vi.advanceTimersByTime(5))
}

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('types one character per 70ms', () => {
    const { result } = renderHook(() => useTypewriter(phrases))
    elapse(70 * 3)
    expect(result.current).toBe('Ful')
  })

  it('holds the full phrase, then deletes', () => {
    const { result } = renderHook(() => useTypewriter(phrases))
    elapse(70 * phrases[0].length)
    expect(result.current).toBe(phrases[0])
    elapse(1400)
    expect(result.current).toBe(phrases[0])
    elapse(100 + 35)
    expect(result.current.length).toBeLessThan(phrases[0].length)
  })

  it('moves to the next phrase once fully deleted', () => {
    const { result } = renderHook(() => useTypewriter(phrases))
    elapse(70 * 20 + 1500 + 35 * 20 + 35)
    elapse(70 * 3)
    expect(result.current).toBe('Sec')
  })

  it('returns the first phrase immediately when disabled', () => {
    const { result } = renderHook(() => useTypewriter(phrases, { enabled: false }))
    expect(result.current).toBe('Full-stack developer')
    elapse(5000)
    expect(result.current).toBe('Full-stack developer')
  })
})
