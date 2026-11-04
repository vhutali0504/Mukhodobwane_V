import { createTerminal, step } from '../terminal/engine.js'
import { BOOT_LINES, BOOT_LINE_MS, GRANT_HOLD_MS, SCAN_MS } from '../terminal/constants.js'
import { profile } from '../../content/profile.js'
import { FACTS } from '../../content/facts.js'
import { TRIVIA } from '../../content/trivia.js'
import { VAULT_WORDS } from '../../content/vaultWords.js'

// Room state = terminal state (pure engine) + camera pose.
//   pose: 'standing' | 'moving' | 'seated'; movingTo says where a move ends.
//   effects: the engine effects of the last change; seq increments on every change;
//   glitchSeq is the seq of the last 'glitch' effect (keys the CSS flicker).

export const CTX = { profile, FACTS, TRIVIA, VAULT_WORDS, rng: Math.random }
const SEATED_MODES = ['menu', 'section', 'msg', 'quiz', 'game']
const INTRO_MS = Math.max(BOOT_LINES.length * BOOT_LINE_MS, SCAN_MS, GRANT_HOLD_MS) + 1

// The 2D view has no desk to sit at: run boot, scan and grant straight through
// to the menu with synthetic timestamps.
export function skipIntro(t, now) {
  let n = now
  for (let i = 0; i < 8 && !SEATED_MODES.includes(t.mode); i++) {
    if (t.mode === 'idle') t = step(t, { type: 'sit', now: n }, CTX).t
    else if (t.mode === 'scan' && t.scanAt < 0) t = step(t, { type: 'pad', now: n }, CTX).t
    else {
      n += INTRO_MS
      t = step(t, { type: 'tick', now: n }, CTX).t
    }
  }
  return t
}

// `seen`: the visitor already sat through the intro this browser session, so the
// terminal starts at the menu instead of replaying boot and the scan.
export function initRoom({ now = 0, twoD = false, seen = false } = {}) {
  const t = createTerminal({ rng: Math.random, now })
  return {
    t: twoD || seen ? skipIntro(t, now) : t,
    pose: 'standing',
    movingTo: 'seated',
    effects: [],
    seq: 0,
    glitchSeq: 0,
  }
}

const bump = (s, patch) => ({ ...s, effects: [], ...patch, seq: s.seq + 1 })

function startMove(s, to) {
  const from = to === 'seated' ? 'standing' : 'seated'
  return s.pose === from ? bump(s, { pose: 'moving', movingTo: to }) : s
}

function engine(s, a) {
  const r = step(s.t, a, CTX)
  if (r.t === s.t && r.effects.length === 0) return s
  let next = { ...s, t: r.t, effects: r.effects, seq: s.seq + 1 }
  if (r.effects.includes('glitch')) next.glitchSeq = next.seq
  if (r.effects.includes('standUp') && s.pose === 'seated') {
    next = { ...next, pose: 'moving', movingTo: 'standing' }
  }
  return next
}

export function roomReducer(s, a) {
  switch (a.type) {
    // A UI `sit` (and the pad while standing) is a camera request. The engine
    // hears `sit` only when the camera arrives at the chair.
    case 'sit':
      return startMove(s, 'seated')
    case 'pad':
      return s.pose === 'standing' ? startMove(s, 'seated') : engine(s, a)
    case 'stand':
      return startMove(s, 'standing')
    case 'arrive': {
      const at = bump(s, { pose: a.at })
      return a.at === 'seated' ? engine(at, { type: 'sit', now: a.now }) : at
    }
    // Entering the 2D view: no camera, and the intro is skipped.
    case 'enter2d': {
      const t = skipIntro(s.t, a.now)
      return t === s.t && s.pose === 'standing' ? s : bump(s, { t, pose: 'standing', movingTo: 'seated' })
    }
    default:
      return engine(s, a)
  }
}
