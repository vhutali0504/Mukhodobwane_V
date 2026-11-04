import '../../styles/transition.css'

// Full-screen cover for the formal/room switch. phase 'out' plays three scanline
// slice shifts, then fades to the scene colour; phase 'in' fades it away.
export default function GlitchOverlay({ phase }) {
  if (!phase) return null
  return (
    <div className={`glitch-overlay is-${phase}`} aria-hidden="true" data-testid="glitch-overlay">
      {phase === 'out' && <div className="glitch-slices" />}
    </div>
  )
}
