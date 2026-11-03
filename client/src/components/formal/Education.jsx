import { profile } from '../../content/profile.js'

export default function Education() {
  const e = profile.education
  return (
    <section className="section" aria-labelledby="education">
      <h2 id="education">Education</h2>
      <h3 className="edu-school">{e.school}</h3>
      <p className="edu-degree">
        {e.degree} · {e.when}
      </p>
      <ul className="chips">
        {e.coursework.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <ul className="edu-notes">
        {e.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </section>
  )
}
