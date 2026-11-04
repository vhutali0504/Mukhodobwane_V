import { Link } from 'react-router'

export const HINTS = {
  standing: 'drag to look around · click the desk to sit down',
  seated: '↑↓ / click to choose · drag to look around · Esc to stand up',
}

function hintFor(pose, movingTo) {
  if (pose !== 'moving') return HINTS[pose] ?? ''
  return movingTo === 'standing' ? 'standing up …' : 'sitting down …'
}

// Overlay on the 3D stage: the current hint, plus the stand / sit / exit controls.
// `controls={false}` hides the buttons when TouchControls already shows them.
export function RoomHud({ pose, movingTo, onStand, onSit, onTextOnly, controls = true }) {
  return (
    <div className="room-hud">
      {controls && (
        <div className="room-hud-bar">
          {pose === 'standing' && onSit && (
            <button type="button" className="room-btn" onClick={onSit}>
              Sit at the desk
            </button>
          )}
          {pose === 'seated' && (
            <button type="button" className="room-btn room-btn-primary" onClick={onStand}>
              Stand up <span aria-hidden="true">[esc]</span>
            </button>
          )}
          {onTextOnly && (
            <button type="button" className="room-btn" onClick={onTextOnly}>
              Text-only view
            </button>
          )}
          <Link className="room-btn room-link" to="/">
            Exit to formal
          </Link>
        </div>
      )}
      <p className="room-hint" role="status">
        {hintFor(pose, movingTo)}
      </p>
    </div>
  )
}
