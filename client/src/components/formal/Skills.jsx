import { profile } from '../../content/profile.js'

export default function Skills() {
  return (
    <section className="section" aria-labelledby="skills">
      <h2 id="skills">Skills</h2>
      <div className="skill-groups">
        {profile.skills.map((g) => (
          <div key={g.group} className="skill-group">
            <h3>{g.group}</h3>
            <ul className="chips">
              {g.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
