import { describe, it, expect } from 'vitest'
import { dragSeatedLook, SEAT_LOOK } from '../../client/src/room/scene/seatedLook.js'

const ZERO = { yaw: 0, pitch: 0 }

describe('seated head turn', () => {
  it('dragging left turns the head left, dragging up looks up', () => {
    const left = dragSeatedLook(ZERO, -100, 0)
    expect(left.yaw).toBeGreaterThan(0)
    const up = dragSeatedLook(ZERO, 0, -100)
    expect(up.pitch).toBeGreaterThan(0)
  })

  it('turns far enough to see every monitor, but not so far you face the empty wall', () => {
    expect(SEAT_LOOK.yaw).toBeGreaterThanOrEqual(0.4)
    expect(SEAT_LOOK.yaw).toBeLessThanOrEqual(0.6)
    expect(SEAT_LOOK.up).toBeGreaterThanOrEqual(0.25)
    expect(SEAT_LOOK.up).toBeLessThanOrEqual(0.4)
  })

  it('is clamped so the visitor cannot spin round to face the wall', () => {
    const far = dragSeatedLook(ZERO, -100000, -100000)
    expect(far).toEqual({ yaw: SEAT_LOOK.yaw, pitch: SEAT_LOOK.up })
    const other = dragSeatedLook(ZERO, 100000, 100000)
    expect(other).toEqual({ yaw: -SEAT_LOOK.yaw, pitch: -SEAT_LOOK.down })
  })

  it('does not mutate the previous look', () => {
    const before = { yaw: 0.1, pitch: 0.1 }
    dragSeatedLook(before, 50, 50)
    expect(before).toEqual({ yaw: 0.1, pitch: 0.1 })
  })
})
