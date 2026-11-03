import { profile } from '../../content/profile.js'

// Fixed bottom bar, shown below 720px only (see formal.css).
export default function MobileCta() {
  return (
    <div className="mobile-cta">
      <a className="btn solid" href="#contact">
        Contact
      </a>
      <a className="btn ghost" href={profile.cvUrl} download>
        Download CV
      </a>
    </div>
  )
}
