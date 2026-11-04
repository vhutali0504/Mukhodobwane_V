import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { MENU } from '../terminal/constants.js'
import { sectionLines } from '../terminal/sections.js'
import { isQuizOver, quizRank } from '../terminal/quiz.js'
import { TerminalButtons } from './TouchControls.jsx'

const REASONS = {
  nowebgl: "Your device can't run the 3D room",
  slow: 'The 3D room is running too slowly on this device',
  timeout: 'The 3D room is taking too long to start',
  error: "The 3D room couldn't load",
  chosen: 'Text-only view of the room',
}
const RETRY = { slow: 'Try the 3D room anyway', chosen: 'Back to the 3D room' }

function Quiz({ z }) {
  if (isQuizOver(z)) {
    return (
      <>
        <p className="rt-amber">RESULTS</p>
        <p className="rt-big">{`${z.score} / ${z.qs.length}`}</p>
        <p className="rt-amber">{quizRank(z.score)}</p>
      </>
    )
  }
  const q = z.qs[z.i]
  const ok = z.picked === q.a
  return (
    <>
      <p className="rt-amber">{`TRIVIA · question ${z.i + 1}/${z.qs.length} · score ${z.score}`}</p>
      <p>{q.q}</p>
      <ul className="rt-list">
        {q.o.map((o, k) => {
          const mark = z.picked === null ? '' : k === q.a ? ' ✓' : k === z.picked ? ' ✗' : ''
          return <li key={k}>{`[${'ABC'[k]}] ${o}${mark}`}</li>
        })}
      </ul>
      {z.picked !== null && (
        <p className={ok ? '' : 'rt-red'}>{ok ? 'correct. +1' : `nope. the answer was ${'ABC'[q.a]}.`}</p>
      )}
    </>
  )
}

function Vault({ g }) {
  return (
    <>
      <p className={g.done === 'win' ? '' : 'rt-amber'}>
        {g.done === 'win' ? 'VAULT OPEN' : `VAULT LOCKED · attempts left ${g.left}/4`}
      </p>
      <p className="rt-dim">One of these words is the password. Likeness = letters in the right spot.</p>
      <ul className="rt-list">
        {g.log.map((l, i) => (
          <li key={i} className={l.includes('LOCKOUT') ? 'rt-red' : l.includes('MATCH') ? '' : 'rt-amber'}>
            {l}
          </li>
        ))}
      </ul>
      {g.done === 'win' && <p className="rt-amber">{`reward: ${g.fact}`}</p>}
    </>
  )
}

// Everything the main monitor would show, as real text. The whole body is
// rendered and the output box scrolls natively.
function Screen({ t, profile }) {
  switch (t.mode) {
    case 'menu':
      return <p className="rt-dim">root@vhutali:~$ ls ./about_me</p>
    case 'section':
      return (
        <>
          <p className="rt-dim">{`root@vhutali:~$ cat ${MENU[t.sec]}.txt`}</p>
          <h2 className="rt-amber rt-h">{`# ${MENU[t.sec].replaceAll('_', ' ').toUpperCase()}`}</h2>
          {sectionLines(t.sec, profile).map((l, i) => (
            <p key={i}>{l || ' '}</p>
          ))}
        </>
      )
    case 'msg':
      return (
        <>
          <p className="rt-dim">{`root@vhutali:~$ ${t.msg.cmd}`}</p>
          {t.msg.lines.map((l, i) => (
            <p key={i}>{l || ' '}</p>
          ))}
        </>
      )
    case 'quiz':
      return <Quiz z={t.quiz} />
    case 'game':
      return <Vault g={t.game} />
    default:
      return <p className="rt-dim">starting terminal…</p>
  }
}

// Lightweight 2D terminal for devices without WebGL or with a very low frame
// rate. Uses the same engine state and actions as the 3D room.
export function TerminalFallback({ t, dispatch, profile, reason = 'nowebgl', onTry3D }) {
  const [text, setText] = useState('')
  const input = useRef(null)

  // Switching to 2D mid-visit (slow device, error, or by choice) moves the keyboard
  // to the command line. A first load without WebGL leaves focus alone.
  useEffect(() => {
    if (reason !== 'nowebgl') input.current?.focus()
  }, [reason])

  function submit(e) {
    e.preventDefault()
    const cmd = text.trim()
    setText('')
    if (cmd) dispatch({ type: 'tapCommand', text: cmd })
  }

  // Same as the 3D terminal: Backspace on an empty command line goes back to the menu.
  function onKeyDown(e) {
    if (e.key === 'Backspace' && text === '' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      dispatch({ type: 'key', key: 'Backspace' })
    }
  }

  return (
    <div className="room-fallback">
      <div className="rt-notice">
        <p className="rt-amber">{REASONS[reason] ?? REASONS.nowebgl}</p>
        <p>Here is the terminal on its own. Everything in it works the same way.</p>
        <p className="rt-actions">
          <Link className="room-btn room-btn-primary" to="/">
            Back to the formal site
          </Link>
          {onTry3D && (
            <button type="button" className="room-btn" onClick={onTry3D}>
              {RETRY[reason] ?? RETRY.slow}
            </button>
          )}
        </p>
      </div>

      <section className="rt-screen" aria-label="Terminal output" tabIndex={0}>
        <div aria-live="polite">
          <Screen t={t} profile={profile} />
        </div>
      </section>

      <div className="room-touch-grid">
        <TerminalButtons t={t} dispatch={dispatch} scroll={false} />
      </div>

      <form className="rt-form" onSubmit={submit}>
        <span className="rt-prompt" aria-hidden="true">
          visitor@vhutali:~$
        </span>
        <input
          ref={input}
          className="rt-input"
          aria-label="Command"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          maxLength={40}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder='type "help"'
        />
        <button type="submit" className="room-btn">
          Run
        </button>
      </form>
    </div>
  )
}
