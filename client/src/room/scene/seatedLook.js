// How far a seated visitor can turn their head (radians) by dragging.
// About 28° left and right (the side monitors), 17° up (the top monitors),
// 14° down (the desk). Further than this you only see the dark walls.
export const SEAT_LOOK = { yaw: 0.5, up: 0.3, down: 0.25 }
const SPEED = 0.0035

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// Pure: returns the new head offset after a drag of (dx, dy) pixels.
// Dragging left turns left and dragging up looks up, like the standing view.
export function dragSeatedLook(look, dx, dy) {
  return {
    yaw: clamp(look.yaw - dx * SPEED, -SEAT_LOOK.yaw, SEAT_LOOK.yaw),
    pitch: clamp(look.pitch - dy * SPEED, -SEAT_LOOK.down, SEAT_LOOK.up),
  }
}
