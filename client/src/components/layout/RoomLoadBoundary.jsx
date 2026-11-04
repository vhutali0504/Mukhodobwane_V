import { Component } from 'react'

const FLAG = 'room-chunk-reloaded'

function readFlag() {
  try {
    return sessionStorage.getItem(FLAG) === '1'
  } catch {
    return false
  }
}
function setFlag() {
  try {
    sessionStorage.setItem(FLAG, '1')
  } catch {
    /* storage blocked: the reload guard simply cannot persist */
  }
}

// Catches a failed load of the lazy /room chunk (stale tab after a deploy, flaky
// network). Reloads once on its own to pick up the new build, then shows a way out.
export class RoomLoadBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.error('The room failed to load', error)
    if (!readFlag()) {
      setFlag()
      this.reload()
    }
  }
  reload = () => (this.props.reload ?? (() => window.location.reload()))()
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="nf">
        <div className="nf-term" role="alert">
          <p className="nf-error">Couldn&apos;t load the room</p>
          <p className="nf-dim">The page may have been updated, or the connection dropped.</p>
          <p className="nf-actions">
            <button type="button" className="nf-btn" onClick={this.reload}>
              Reload
            </button>
            <a className="nf-link" href="/">
              Back to the formal site
            </a>
          </p>
        </div>
      </main>
    )
  }
}
