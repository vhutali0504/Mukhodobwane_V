import { useState } from 'react'
import { profile } from '../../content/profile.js'
import ModeSwitch from './ModeSwitch.jsx'

const LINKS = ['Work', 'Experience', 'Skills', 'Contact']

export default function TopBar({ onActivate }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="topbar">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <span className="topbar-logo">{profile.shortName}</span>
      <nav id="site-nav" className={`topbar-nav${open ? ' is-open' : ''}`} aria-label="Sections">
        {LINKS.map((label) => (
          <a key={label} href={`#${label.toLowerCase()}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <div className="topbar-actions">
        <ModeSwitch onActivate={onActivate} />
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>
    </header>
  )
}
