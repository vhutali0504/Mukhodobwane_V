import { profile } from '../../content/profile.js'
import TypedRole from './TypedRole.jsx'

const [first, ...rest] = profile.name.split(' ')
const last = rest.join(' ')
const SIZES = '(max-width: 720px) 80vw, 340px'

export default function Hero() {
  const { base, alt } = profile.photo
  return (
    <section className="hero" aria-labelledby="hero-name">
      <div className="hero-copy">
        <p className="kicker mono">{profile.location}</p>
        <h1 id="hero-name">
          <span className="name-line">
            <b>{first}</b>
          </span>{' '}
          <span className="name-line">
            <b>{last}</b>
          </span>
        </h1>
        <TypedRole />
        <p className="lede">{profile.summary}</p>
        <div className="ctas">
          <a className="btn solid" href="#work">
            View my work
          </a>
          <a className="btn ghost" href={profile.cvUrl} download>
            Download CV
          </a>
        </div>
        <p className="avail">
          <span className="avail-dot" aria-hidden="true" />
          {profile.availability}
        </p>
      </div>
      <div className="photo">
        <picture>
          {['avif', 'webp'].map((ext) => (
            <source
              key={ext}
              type={`image/${ext}`}
              srcSet={`${base}-480.${ext} 480w, ${base}-600.${ext} 600w`}
              sizes={SIZES}
            />
          ))}
          <img
            src={`${base}-600.jpg`}
            srcSet={`${base}-480.jpg 480w, ${base}-600.jpg 600w`}
            sizes={SIZES}
            width="600"
            height="750"
            alt={alt}
            fetchPriority="high"
          />
        </picture>
        <div className="idcard">
          <strong>{profile.idCard.title}</strong>
          <span>{profile.idCard.org}</span>
        </div>
      </div>
    </section>
  )
}
