import { profile } from '../../content/profile.js'

export default function Experience() {
  return (
    <section className="section" aria-labelledby="experience">
      <h2 id="experience">Experience</h2>
      <ol className="timeline">
        {profile.experience.map((e) => (
          <li key={e.org} className="tl-item">
            <h3>
              {e.title}, {e.org}
            </h3>
            <p className="tl-when">
              {e.when}
              {e.location ? ` · ${e.location}` : ''}
            </p>
            <ul>
              {e.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
