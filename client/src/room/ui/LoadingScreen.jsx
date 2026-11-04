import { Link } from 'react-router'

// Themed loading screen. Pure: no three.js and no room.css import, so App.jsx can
// use it as the lazy /room fallback without pulling room code into the formal
// bundle. Layout is inline for that reason; room.css adds the caret blink.
// `progress` is 0-100, or null while the room code itself is still downloading.
// It always offers a way out, since it covers the HUD while it is up.
const STYLE = {
  position: 'fixed',
  inset: 0,
  zIndex: 5,
  display: 'grid',
  placeItems: 'center',
  padding: 'var(--s-4)',
  background: 'var(--room-bg)',
  color: 'var(--room-green)',
  font: '14px var(--font-mono)',
  textAlign: 'center',
}
const LINK = { display: 'inline-block', marginTop: 'var(--s-4)', color: 'var(--room-green)', textUnderlineOffset: '3px' }

export function LoadingScreen({ progress = null }) {
  const pct = progress === null ? '' : ` ${String(Math.round(progress)).padStart(2, '0')}%`
  return (
    <div className="room-loading" style={STYLE}>
      <div>
        <p role="status" aria-live="polite">
          booting room…{pct}
          <span className="room-caret" aria-hidden="true">
            _
          </span>
        </p>
        <Link className="room-loading-link" style={LINK} to="/">
          Back to the formal site
        </Link>
      </div>
    </div>
  )
}
