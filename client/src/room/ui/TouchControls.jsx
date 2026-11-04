import { useSyncExternalStore } from 'react'
import { Link } from 'react-router'
import { MENU } from '../terminal/constants.js'
import { isQuizOver } from '../terminal/quiz.js'

const COARSE = '(pointer: coarse)'
const TOUCH_SCROLL = 3

function getMql() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(COARSE)
    : null
}
function subscribe(onChange) {
  const mql = getMql()
  if (!mql) return () => {}
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

export function useCoarsePointer() {
  return useSyncExternalStore(subscribe, () => getMql()?.matches ?? false, () => false)
}

const Btn = ({ children, ...rest }) => (
  <button type="button" className="room-btn" {...rest}>
    {children}
  </button>
)

const toMenu = (dispatch) => <Btn onClick={() => dispatch({ type: 'tapCommand', text: 'menu' })}>Menu</Btn>

// The tappable equivalent of every terminal action in the current mode.
// Shared by TouchControls (3D room on touch screens) and TerminalFallback (2D).
// `scroll={false}` drops the scroll buttons where the text scrolls natively.
export function TerminalButtons({ t, dispatch, scroll = true }) {
  const click = (index) => dispatch({ type: 'clickLine', index })
  switch (t.mode) {
    case 'scan':
      return (
        <Btn onClick={() => dispatch({ type: 'pad' })} disabled={t.scanAt >= 0}>
          Scan fingerprint
        </Btn>
      )
    case 'menu':
      return MENU.map((id, i) => (
        <Btn key={id} onClick={() => click(i)} aria-current={i === t.sel ? 'true' : undefined}>
          {`${String(i + 1).padStart(2, '0')} ${id}`}
        </Btn>
      ))
    case 'section':
    case 'msg':
      return (
        <>
          {scroll && (
            <>
              <Btn onClick={() => dispatch({ type: 'scroll', delta: -TOUCH_SCROLL })} disabled={t.scroll <= 0}>
                <span aria-hidden="true">▲ </span>Scroll up
              </Btn>
              <Btn onClick={() => dispatch({ type: 'scroll', delta: TOUCH_SCROLL })} disabled={t.scroll >= t.scrollMax}>
                <span aria-hidden="true">▼ </span>Scroll down
              </Btn>
            </>
          )}
          {t.msg?.fact && <Btn onClick={() => click(0)}>Another fact</Btn>}
          {toMenu(dispatch)}
        </>
      )
    case 'quiz': {
      const z = t.quiz
      if (isQuizOver(z)) {
        return (
          <>
            <Btn onClick={() => click(0)}>Play again</Btn>
            {toMenu(dispatch)}
          </>
        )
      }
      const q = z.qs[z.i]
      return (
        <>
          {q.o.map((o, k) => (
            <Btn key={k} onClick={() => click(k)} disabled={z.picked !== null}>
              {`${'ABC'[k]}: ${o}`}
            </Btn>
          ))}
          <Btn onClick={() => click(0)} disabled={z.picked === null}>
            Next
          </Btn>
          {toMenu(dispatch)}
        </>
      )
    }
    case 'game': {
      const g = t.game
      const tried = (w) => g.log.some((l) => l.startsWith(`> ${w} `))
      return (
        <>
          {g.words.map((w, i) => (
            <Btn key={w} onClick={() => click(i)} disabled={!!g.done || tried(w)}>
              {w}
            </Btn>
          ))}
          <Btn onClick={() => dispatch({ type: 'tapCommand', text: 'hack' })}>Play again</Btn>
          {toMenu(dispatch)}
        </>
      )
    }
    default:
      return null
  }
}

// On-screen controls below the canvas on touch screens. Hidden on fine pointers,
// where the keyboard and mouse cover everything. `onTextOnly` adds the switch to
// the 2D view (the only readable view for screen readers on a phone).
export function TouchControls({ t, dispatch, pose = 'seated', onTextOnly }) {
  const coarse = useCoarsePointer()
  if (!coarse) return null
  return (
    <nav className="room-touch" aria-label="Terminal controls">
      <div className="room-touch-row">
        {pose === 'standing' && <Btn onClick={() => dispatch({ type: 'sit' })}>Sit down</Btn>}
        <Btn onClick={() => dispatch({ type: 'key', key: 'Escape' })} disabled={pose !== 'seated'}>
          Stand up
        </Btn>
        {onTextOnly && <Btn onClick={onTextOnly}>Text-only view</Btn>}
        <Link className="room-btn room-link" to="/">
          Exit to formal
        </Link>
      </div>
      {pose === 'seated' && (
        <div className="room-touch-grid">
          <TerminalButtons t={t} dispatch={dispatch} />
        </div>
      )}
    </nav>
  )
}
