// Dark navy pill that links to the 3D room. onActivate plays the glitch transition;
// without it (or with a modified click) the plain link works.
export default function ModeSwitch({ onActivate }) {
  return (
    <a className="mode-switch mono" href="/room" onClick={onActivate}>
      <i className="mode-switch-track" aria-hidden="true" />
      <span aria-hidden="true">hacker mode</span>
      <span className="visually-hidden">Switch to hacker mode</span>
    </a>
  )
}
