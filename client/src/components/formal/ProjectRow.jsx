import { useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'

export default function ProjectRow({ project, index }) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const panelId = `project-${project.id}`
  const buttonId = `${panelId}-button`
  const num = String(index + 1).padStart(2, '0')

  return (
    <li className={`row${open ? ' is-open' : ''}${reduced ? ' is-instant' : ''}`}>
      <h3 className="row-head">
        <button
          type="button"
          id={buttonId}
          className="row-button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="n mono" aria-hidden="true">
            {num}
          </span>
          <span className="row-main">
            <span className="row-title">{project.title}</span>
            <span className="row-sum">
              {project.kind} · {project.when}
            </span>
            <span className="tags">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </span>
          </span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
      </h3>
      <div className="row-panel" id={panelId} role="region" aria-labelledby={buttonId} inert={!open}>
        <div className="row-panel-clip">
          <div className="row-panel-body">
            <ul className="row-bullets">
              {project.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="row-meta">
              <span>{project.when}</span>
              <span>{project.stack.join(', ')}</span>
            </p>
            {project.links.length > 0 && (
              <ul className="row-links">
                {project.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
